package com.myfinance.backend.repository;

import com.myfinance.backend.model.Transaction;
import com.myfinance.backend.model.TransactionFrequency;
import com.myfinance.backend.model.TransactionType;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

/** Composable filters for {@link TransactionRepository}'s paginated search. */
public final class TransactionSpecifications {

    private TransactionSpecifications() {
    }

    public static Specification<Transaction> householdId(UUID householdId) {
        return (root, query, cb) -> cb.equal(root.get("householdId"), householdId);
    }

    public static Specification<Transaction> type(TransactionType type) {
        if (type == null) return null;
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    public static Specification<Transaction> categoryId(UUID categoryId) {
        if (categoryId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    public static Specification<Transaction> frequency(TransactionFrequency frequency) {
        if (frequency == null) return null;
        return (root, query, cb) -> cb.equal(root.get("frequency"), frequency);
    }

    public static Specification<Transaction> descriptionContains(String search) {
        if (search == null || search.isBlank()) return null;
        String pattern = "%" + search.trim().toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("description")), pattern);
    }
}
