package com.myfinance.backend;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;

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
}
