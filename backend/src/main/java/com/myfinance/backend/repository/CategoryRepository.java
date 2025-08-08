package com.myfinance.backend.repository;

import com.myfinance.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    // Buscar categorias por nome ignorando maiúsculas/minúsculas
    Optional<Category> findByNameIgnoreCase(String name);

    // Verificar se existe categoria pelo nome (case insensitive)
    boolean existsByNameIgnoreCase(String name);

    // Buscar categorias por lista de nomes (case insensitive)
    List<Category> findByNameInIgnoreCase(List<String> names);

    // Buscar todas as categorias ordenadas por nome
    List<Category> findAllByOrderByNameAsc();
}
