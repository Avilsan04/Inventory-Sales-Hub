package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Inventory;
import com.inventory_sales_hub.app.model.entities.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface StockMovementDao extends JpaRepository<StockMovement, Long> {

    @Query("SELECT m FROM StockMovement m JOIN FETCH m.inventory ORDER BY m.createdAt DESC")
    List<StockMovement> findAllOrderByCreatedAtDesc();

    void deleteAllByInventory(Inventory inventory);
}
