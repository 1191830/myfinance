package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.model.User;
import com.myfinance.backend.repository.CategoryRepository;
import com.myfinance.backend.repository.UserRepository;
import com.myfinance.backend.security.SecurityUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findByUserIdOrderByNameAsc(SecurityUtils.currentUserId());
    }

    @Override
    public Optional<Category> getCategoryById(UUID id) {
        return categoryRepository.findByIdAndUserId(id, SecurityUtils.currentUserId());
    }

    @Override
    public Category createCategory(Category category) {
        UUID userId = SecurityUtils.currentUserId();
        if (categoryRepository.existsByUserIdAndNameIgnoreCase(userId, category.getName())) {
            throw new IllegalArgumentException("Category with this name already exists.");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists."));
        category.setUser(user);
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(UUID id, Category category) {
        return categoryRepository.findByIdAndUserId(id, SecurityUtils.currentUserId()).map(existingCategory -> {
            existingCategory.setName(category.getName());
            existingCategory.setMonthlyBudget(category.getMonthlyBudget());
            return categoryRepository.save(existingCategory);
        }).orElseThrow(() -> new IllegalArgumentException("Category not found."));
    }

    @Override
    public void deleteCategory(UUID id) {
        Category existing = categoryRepository.findByIdAndUserId(id, SecurityUtils.currentUserId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found."));
        categoryRepository.delete(existing);
    }

    @Override
    public boolean existsByNameIgnoreCase(String name) {
        return categoryRepository.existsByUserIdAndNameIgnoreCase(SecurityUtils.currentUserId(), name);
    }
}
