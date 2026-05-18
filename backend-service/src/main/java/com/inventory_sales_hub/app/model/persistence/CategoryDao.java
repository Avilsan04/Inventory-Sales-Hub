package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryDao extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndTenantId(String name, Long tenantId);
    List<Category> findAllByTenantId(Long tenantId);
}
