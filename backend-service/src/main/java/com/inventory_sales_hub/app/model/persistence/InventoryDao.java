package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface InventoryDao extends JpaRepository<Inventory, Long> {

    // Tenant-scoped full-list (used for in-memory filter by status when DB pagination not needed)
    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category WHERE p.tenantId = :tenantId")
    List<Inventory> findAllWithProductByTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category")
    List<Inventory> findAllWithProduct();

    // DB-paginated with search + status filters (status handled in WHERE clause)
    @Query(value = "SELECT i FROM Inventory i JOIN i.product p LEFT JOIN p.category WHERE p.tenantId = :tenantId AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(COALESCE(p.sku, '')) LIKE LOWER(CONCAT('%', :search, '%'))) AND (:status IS NULL OR (:status = 'LOW_STOCK' AND i.quantity > 0 AND i.quantity <= i.minStock) OR (:status = 'OUT_OF_STOCK' AND i.quantity = 0) OR (:status NOT IN ('LOW_STOCK', 'OUT_OF_STOCK')))",
           countQuery = "SELECT COUNT(i) FROM Inventory i JOIN i.product p WHERE p.tenantId = :tenantId AND (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(COALESCE(p.sku, '')) LIKE LOWER(CONCAT('%', :search, '%'))) AND (:status IS NULL OR (:status = 'LOW_STOCK' AND i.quantity > 0 AND i.quantity <= i.minStock) OR (:status = 'OUT_OF_STOCK' AND i.quantity = 0) OR (:status NOT IN ('LOW_STOCK', 'OUT_OF_STOCK')))")
    Page<Inventory> findPageByTenantAndFilter(@Param("tenantId") Long tenantId, @Param("search") String search, @Param("status") String status, Pageable pageable);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category WHERE i.id = :id AND p.tenantId = :tenantId")
    Optional<Inventory> findByIdWithProductAndTenant(@Param("id") Long id, @Param("tenantId") Long tenantId);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category WHERE i.id = :id")
    Optional<Inventory> findByIdWithProduct(@Param("id") Long id);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category WHERE i.quantity <= i.minStock AND p.tenantId = :tenantId")
    List<Inventory> findLowStockByTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product p LEFT JOIN FETCH p.category WHERE i.quantity <= i.minStock")
    List<Inventory> findLowStock();

    @Query("SELECT i FROM Inventory i JOIN FETCH i.product WHERE i.product.id = :productId")
    Optional<Inventory> findByProductId(@Param("productId") Long productId);

    @Modifying(clearAutomatically = true)
    @Query("UPDATE Inventory i SET i.quantity = i.quantity - :qty WHERE i.product.id = :productId AND i.quantity >= :qty")
    int deductStock(@Param("productId") Long productId, @Param("qty") int qty);
}
