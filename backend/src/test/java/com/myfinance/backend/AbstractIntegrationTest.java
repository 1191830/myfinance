package com.myfinance.backend;

import com.jayway.jsonpath.JsonPath;
import com.myfinance.backend.model.Household;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.HouseholdRepository;
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
    private HouseholdRepository householdRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    protected record SeededUser(String username, String password, String token) {
    }

    /**
     * Seeds a fresh test user into the given household and logs in through the real
     * /api/auth/login flow, returning the username/password (for tests that need to log in
     * again, e.g. after a password change) alongside the token. Use this overload when a
     * test needs two users sharing one household (proving sharing works) - pass the same
     * householdId to both.
     */
    protected SeededUser seedUserAndLogin(MockMvc mockMvc, UUID householdId) throws Exception {
        String username = "it-user-" + UUID.randomUUID();
        String rawPassword = "test-password";
        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setHouseholdId(householdId);
        userRepository.save(user);

        String response = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"" + username + "\",\"password\":\"" + rawPassword + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        String token = JsonPath.read(response, "$.token");
        return new SeededUser(username, rawPassword, token);
    }

    /**
     * Seeds a fresh test user into a brand-new, private household - the default for any
     * new account in production too, unless a migration explicitly places it into an
     * existing one.
     */
    protected SeededUser seedUserAndLogin(MockMvc mockMvc) throws Exception {
        return seedUserAndLogin(mockMvc, newHousehold());
    }

    protected UUID newHousehold() {
        Household household = new Household();
        return householdRepository.save(household).getId();
    }

    /**
     * Every protected endpoint now requires a Bearer token - seeds a fresh test user and
     * logs in through the real /api/auth/login flow, returning a token ready to attach as
     * an Authorization header on the rest of a test's MockMvc calls.
     */
    protected String loginAsNewUser(MockMvc mockMvc) throws Exception {
        return seedUserAndLogin(mockMvc).token();
    }
}
