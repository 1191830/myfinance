package com.myfinance.backend.service;

import com.myfinance.backend.model.Category;
import com.myfinance.backend.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAllByOrderByNameAsc();
    }

    @Override
    public Optional<Category> getCategoryById(UUID id) {
        return categoryRepository.findById(id);
    }

    @Override
    public Category createCategory(Category category) {

        if (categoryRepository.existsByNameIgnoreCase(category.getName())) {
            throw new IllegalArgumentException("Category with this name already exists.");
        }
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(UUID id, Category category) {
        return categoryRepository.findById(id).map(existingCategory -> {
            existingCategory.setName(category.getName());
            return categoryRepository.save(existingCategory);
        }).orElseThrow(() -> new IllegalArgumentException("Category not found."));
    }

    @Override
    public void deleteCategory(UUID id) {
        categoryRepository.deleteById(id);
    }

    @Override
    public boolean existsByNameIgnoreCase(String name) {
        return categoryRepository.existsByNameIgnoreCase(name);
    }
}
