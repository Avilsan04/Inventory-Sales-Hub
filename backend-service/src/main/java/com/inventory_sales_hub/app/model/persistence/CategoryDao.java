package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryDao extends JpaRepository<Category, Long> {
    boolean existsByName(String name);
}
