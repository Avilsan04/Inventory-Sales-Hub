package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryDao extends JpaRepository<Inventory, Long> {

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category")
    List<Inventory> findAllWithProduct();

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category WHERE i.id = :id")
    Optional<Inventory> findByIdWithProduct(@Param("id") Long id);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category WHERE i.quantity <= i.minStock")
    List<Inventory> findLowStock();

    Optional<Inventory> findByProductId(Long productId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :qty WHERE i.product.id = :productId AND i.quantity >= :qty")
    int deductStock(@Param("productId") Long productId, @Param("qty") int qty);
}
