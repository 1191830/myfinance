package com.myfinance.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;

/**
 * A group of users who share the same data (categories, transactions, investments, saving
 * goals). Never managed through the API - accounts are placed into one by a Flyway
 * migration, the same way accounts themselves are admin-created.
 */
@Entity
@Table(name = "households")
public class Household {

    @Id
    @GeneratedValue
    private UUID id;

    private String name;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
