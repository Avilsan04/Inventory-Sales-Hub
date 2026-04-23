package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductDao extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
}
