package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductDao extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
    boolean existsBySkuAndTenantId(String sku, Long tenantId);
    boolean existsBySkuAndTenantIdAndIdNot(String sku, Long tenantId, Long id);
    boolean existsBySupplierId(Long supplierId);
    boolean existsBySupplierIdAndTenantId(Long supplierId, Long tenantId);
    long countByActiveTrue();
    long countByActiveTrueAndTenantId(Long tenantId);

    List<Product> findAllByActiveTrue();

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.supplier WHERE p.active = true AND p.tenantId = :tenantId")
    List<Product> findAllByActiveTrueAndTenantId(@Param("tenantId") Long tenantId);

    Optional<Product> findByIdAndActiveTrue(Long id);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.supplier WHERE p.id = :id AND p.active = true AND p.tenantId = :tenantId")
    Optional<Product> findByIdAndActiveTrueAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.supplier.id = :supplierId AND p.active = true AND p.tenantId = :tenantId")
    List<Product> findActiveBySupplierAndTenant(@Param("supplierId") Long supplierId, @Param("tenantId") Long tenantId);

    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category WHERE p.supplier.id = :supplierId AND p.active = true")
    List<Product> findActiveBySupplier(@Param("supplierId") Long supplierId);
}
