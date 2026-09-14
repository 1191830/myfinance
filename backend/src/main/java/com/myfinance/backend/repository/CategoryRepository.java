package com.myfinance.backend.repository;

import com.myfinance.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByIdAndUserId(UUID id, UUID userId);

    // Verificar se existe categoria pelo nome (case insensitive), para este utilizador
    boolean existsByUserIdAndNameIgnoreCase(UUID userId, String name);

    // Buscar categorias por lista de nomes (case insensitive), para este utilizador
    List<Category> findByUserIdAndNameInIgnoreCase(UUID userId, List<String> names);

    // Buscar todas as categorias deste utilizador ordenadas por nome
    List<Category> findByUserIdOrderByNameAsc(UUID userId);
}
