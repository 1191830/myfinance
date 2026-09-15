package com.myfinance.backend.repository;

import com.myfinance.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryRepository extends JpaRepository<Category, UUID> {

    Optional<Category> findByIdAndHouseholdId(UUID id, UUID householdId);

    // Verificar se existe categoria pelo nome (case insensitive), para este agregado familiar
    boolean existsByHouseholdIdAndNameIgnoreCase(UUID householdId, String name);

    // Buscar categorias por lista de nomes (case insensitive), para este agregado familiar
    List<Category> findByHouseholdIdAndNameInIgnoreCase(UUID householdId, List<String> names);

    // Buscar todas as categorias deste agregado familiar ordenadas por nome
    List<Category> findByHouseholdIdOrderByNameAsc(UUID householdId);
}
