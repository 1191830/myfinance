package com.myfinance.backend;

import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Base for tests that need a real Postgres. Spring Boot wires the DataSource from the
 * container via @ServiceConnection, and Flyway runs V1-V5 (including V2's demo-data seed)
 * against it exactly as on a real boot - so tests must assert against what they create or
 * fetch by id, never table-wide counts, since that seed data is always present too.
 */
@Testcontainers
public abstract class AbstractIntegrationTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16");
}
