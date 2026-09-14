package com.myfinance.backend;

import com.jayway.jsonpath.JsonPath;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Base for tests that need a real Postgres. Spring Boot wires the DataSource from the
 * container via @ServiceConnection, and Flyway runs V1-V5 (including V2's demo-data seed)
 * against it exactly as on a real boot - so tests must assert against what they create or
 * fetch by id, never table-wide counts, since that seed data is always present too.
 *
 * The container is started once, manually, in a static initializer rather than via
 * @Testcontainers/@Container - that JUnit5 extension manages full start/stop lifecycle
 * PER TEST CLASS, so a container field merely inherited from this shared base gets stopped
 * after the first subclass's tests finish, breaking every subclass that runs after it. This
 * "singleton container" pattern keeps it alive for the whole test run instead; Testcontainers'
 * own Ryuk reaper still tears it down when the JVM exits.
 */
public abstract class AbstractIntegrationTest {

    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");

    static {
        postgres.start();
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Every protected endpoint now requires a Bearer token - seeds a fresh test user and
     * logs in through the real /api/auth/login flow, returning a token ready to attach as
     * an Authorization header on the rest of a test's MockMvc calls.
     */
    protected String loginAsNewUser(MockMvc mockMvc) throws Exception {
        String username = "it-user-" + UUID.randomUUID();
        String rawPassword = "test-password";
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        userRepository.save(user);

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + rawPassword + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        return JsonPath.read(response, "$.token");
    }
}
