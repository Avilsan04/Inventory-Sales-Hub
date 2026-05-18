package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierDao extends JpaRepository<Supplier, Long> {
    boolean existsByEmail(String email);
    boolean existsByEmailAndTenantId(String email, Long tenantId);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByEmailAndIdNotAndTenantId(String email, Long id, Long tenantId);

    Page<Supplier> findByTenantId(Long tenantId, Pageable pageable);

    @Query("SELECT s FROM Supplier s WHERE s.tenantId = :tenantId AND (LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(COALESCE(s.email, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Supplier> findByTenantIdAndSearch(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);

    Page<Supplier> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);

    boolean existsById(Long id);
}
