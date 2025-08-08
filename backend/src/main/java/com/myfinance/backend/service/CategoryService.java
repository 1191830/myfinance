package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryService {

    List<Category> getAllCategories();

    Optional<Category> getCategoryById(UUID id);

    Category createCategory(Category category);

    Category updateCategory(UUID id, Category category);

    void deleteCategory(UUID id);

    boolean existsByNameIgnoreCase(String name);
}
