package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Sale;
import com.inventory_sales_hub.app.model.entities.SaleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SaleDao extends JpaRepository<Sale, Long>, JpaSpecificationExecutor<Sale> {

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.processedBy WHERE s.tenantId = :tenantId ORDER BY s.createdAt DESC")
    List<Sale> findAllWithDetailsByTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.processedBy ORDER BY s.createdAt DESC")
    List<Sale> findAllWithDetails();

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.processedBy WHERE s.id = :id AND s.tenantId = :tenantId")
    Optional<Sale> findByIdWithDetailsAndTenant(@Param("id") Long id, @Param("tenantId") Long tenantId);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.processedBy WHERE s.id = :id")
    Optional<Sale> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.status = :status AND s.createdAt >= :start AND s.createdAt < :end AND s.tenantId = :tenantId")
    BigDecimal sumRevenueBetweenAndTenant(@Param("status") SaleStatus status, @Param("start") Instant start, @Param("end") Instant end, @Param("tenantId") Long tenantId);

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.status = :status AND s.createdAt >= :start AND s.createdAt < :end")
    BigDecimal sumRevenueBetween(@Param("status") SaleStatus status, @Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = :status AND s.createdAt >= :start AND s.createdAt < :end AND s.tenantId = :tenantId")
    long countBetweenAndTenant(@Param("status") SaleStatus status, @Param("start") Instant start, @Param("end") Instant end, @Param("tenantId") Long tenantId);

    @Query("SELECT COUNT(s) FROM Sale s WHERE s.status = :status AND s.createdAt >= :start AND s.createdAt < :end")
    long countBetween(@Param("status") SaleStatus status, @Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT s FROM Sale s WHERE s.status = :status AND s.createdAt >= :start AND s.createdAt < :end ORDER BY s.createdAt")
    List<Sale> findByStatusAndPeriod(@Param("status") SaleStatus status, @Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT s.customer.id, s.customer.name, COUNT(s), SUM(s.total) FROM Sale s WHERE s.customer IS NOT NULL AND s.status = :status AND s.tenantId = :tenantId GROUP BY s.customer.id, s.customer.name ORDER BY SUM(s.total) DESC")
    List<Object[]> findTopCustomersByTenant(@Param("status") SaleStatus status, @Param("tenantId") Long tenantId, Pageable pageable);

    @Query("SELECT s.customer.id, s.customer.name, COUNT(s), SUM(s.total) FROM Sale s WHERE s.customer IS NOT NULL AND s.status = :status GROUP BY s.customer.id, s.customer.name ORDER BY SUM(s.total) DESC")
    List<Object[]> findTopCustomers(@Param("status") SaleStatus status, Pageable pageable);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.processedBy WHERE s.customer.email = :email AND s.tenantId = :tenantId ORDER BY s.createdAt DESC")
    List<Sale> findAllByCustomerEmailAndTenant(@Param("email") String email, @Param("tenantId") Long tenantId);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.processedBy WHERE s.customer.email = :email ORDER BY s.createdAt DESC")
    List<Sale> findAllByCustomerEmail(@Param("email") String email);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.processedBy WHERE s.tenantId = :tenantId ORDER BY s.createdAt DESC")
    List<Sale> findRecentByTenant(@Param("tenantId") Long tenantId, Pageable pageable);

    @Query("SELECT s FROM Sale s LEFT JOIN FETCH s.customer LEFT JOIN FETCH s.processedBy ORDER BY s.createdAt DESC")
    List<Sale> findRecent(Pageable pageable);
}
