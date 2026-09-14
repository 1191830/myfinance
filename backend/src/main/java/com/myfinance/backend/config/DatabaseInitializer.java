package com.myfinance.backend.config;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

@Component
public class DatabaseInitializer implements ApplicationRunner {

    private final DataSource dataSource;

    public DatabaseInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("CREATE DATABASE personal_finance_db");
            System.out.println("✅ Database created");
        } catch (SQLException e) {
            if ("42P04".equals(e.getSQLState())) { // database already exists
                System.out.println("ℹ Database already exists");
            } else {
                // This is a local-dev convenience only (the target database already exists
                // on any managed host, e.g. Supabase, whose role may not even have
                // CREATE DATABASE privileges) - never let it fail application startup.
                System.out.println("ℹ Skipping database creation: " + e.getMessage());
            }
        }
    }
}
