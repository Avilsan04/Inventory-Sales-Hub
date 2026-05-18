package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerDao extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    boolean existsByEmailAndTenantId(String email, Long tenantId);
    boolean existsByEmailAndIdNot(String email, Long id);
    boolean existsByEmailAndIdNotAndTenantId(String email, Long id, Long tenantId);

    Page<Customer> findByTenantId(Long tenantId, Pageable pageable);
    Page<Customer> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.tenantId = :tenantId AND (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(COALESCE(c.email, '')) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Customer> findByTenantIdAndSearch(@Param("tenantId") Long tenantId, @Param("search") String search, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.id = :id AND c.tenantId = :tenantId")
    java.util.Optional<Customer> findByIdAndTenantId(@Param("id") Long id, @Param("tenantId") Long tenantId);
}
