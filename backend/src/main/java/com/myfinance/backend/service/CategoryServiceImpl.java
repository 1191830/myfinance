package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.CurrentHousehold;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final CurrentHousehold currentHousehold;

    public CategoryServiceImpl(CategoryRepository categoryRepository, UserRepository userRepository,
            CurrentHousehold currentHousehold) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentHousehold = currentHousehold;
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findByHouseholdIdOrderByNameAsc(currentHousehold.resolve());
    }

    @Override
    public Optional<Category> getCategoryById(UUID id) {
        return categoryRepository.findByIdAndHouseholdId(id, currentHousehold.resolve());
    }

    @Override
    public Category createCategory(Category category) {
        UUID householdId = currentHousehold.resolve();
        if (categoryRepository.existsByHouseholdIdAndNameIgnoreCase(householdId, category.getName())) {
            throw new IllegalArgumentException("Category with this name already exists.");
        }
        User user = userRepository.findById(SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        category.setUser(user);
        category.setHouseholdId(householdId);
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(UUID id, Category category) {
        return categoryRepository.findByIdAndHouseholdId(id, currentHousehold.resolve()).map(existingCategory -> {
            existingCategory.setName(category.getName());
            existingCategory.setMonthlyBudget(category.getMonthlyBudget());
            return categoryRepository.save(existingCategory);
        }).orElseThrow(() -> new IllegalArgumentException("Category not found."));
    }

    @Override
    public void deleteCategory(UUID id) {
        Category existing = categoryRepository.findByIdAndHouseholdId(id, currentHousehold.resolve())
                .orElseThrow(() -> new IllegalArgumentException("Category not found."));
        categoryRepository.delete(existing);
    }

    @Override
    public boolean existsByNameIgnoreCase(String name) {
        return categoryRepository.existsByHouseholdIdAndNameIgnoreCase(currentHousehold.resolve(), name);
    }
}
