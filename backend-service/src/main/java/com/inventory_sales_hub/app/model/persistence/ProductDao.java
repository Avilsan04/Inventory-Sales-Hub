package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductDao extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
    boolean existsBySupplierId(Long supplierId);
    long countByActiveTrue();
    List<Product> findAllByActiveTrue();
    Optional<Product> findByIdAndActiveTrue(Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.supplier.id = :supplierId AND p.active = true")
    List<Product> findActiveBySupplier(@Param("supplierId") Long supplierId);
}
