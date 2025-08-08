package com.myfinance.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "investments")
public class Investment {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String type;  // ETF, Stock, Crypto, etc.

    private String ticker;

    @Column(name = "amount_invested", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountInvested;

    @Column(name = "current_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentValue;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "last_synced")
    private LocalDateTime lastSynced;

    // getters and setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public BigDecimal getAmountInvested() {
        return amountInvested;
    }

    public void setAmountInvested(BigDecimal amountInvested) {
        this.amountInvested = amountInvested;
    }

    public BigDecimal getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(BigDecimal currentValue) {
        this.currentValue = currentValue;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getLastSynced() {
        return lastSynced;
    }

    public void setLastSynced(LocalDateTime lastSynced) {
        this.lastSynced = lastSynced;
    }
}
