package com.myfinance.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

@Entity
@Table(name = "settings")
public class Settings {

    @Id
    @GeneratedValue
    private UUID id;

    @NotBlank(message = "O nome é obrigatório")
    @Column(name = "display_name", nullable = false)
    private String displayName;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }
}
