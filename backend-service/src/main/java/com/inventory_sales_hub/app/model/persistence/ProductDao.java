package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductDao extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
    List<Product> findAllByActiveTrue();
    Optional<Product> findByIdAndActiveTrue(Long id);
}
