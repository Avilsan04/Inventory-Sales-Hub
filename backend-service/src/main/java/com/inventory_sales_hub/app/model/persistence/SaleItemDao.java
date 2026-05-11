package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Sale;
import com.inventory_sales_hub.app.model.entities.SaleItem;
import com.inventory_sales_hub.app.model.entities.SaleStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public interface SaleItemDao extends JpaRepository<SaleItem, Long> {

    @Query("SELECT si FROM SaleItem si JOIN FETCH si.product p LEFT JOIN FETCH p.category WHERE si.sale.id = :saleId")
    List<SaleItem> findBySaleIdWithProduct(@Param("saleId") Long saleId);

    @Query("SELECT si FROM SaleItem si JOIN FETCH si.product p LEFT JOIN FETCH p.category WHERE si.sale IN :sales")
    List<SaleItem> findBySalesWithProduct(@Param("sales") List<Sale> sales);

    @Query("SELECT COALESCE(SUM(si.quantity * (si.unitPrice - si.product.purchasePrice)), 0) FROM SaleItem si WHERE si.sale.status = :status AND si.sale.createdAt >= :start AND si.sale.createdAt < :end")
    BigDecimal sumNetProfitBetween(@Param("status") SaleStatus status, @Param("start") Instant start, @Param("end") Instant end);

    @Query("SELECT si.product.id, si.product.name, SUM(si.quantity) FROM SaleItem si WHERE si.sale.status = :status GROUP BY si.product.id, si.product.name ORDER BY SUM(si.quantity) DESC")
    List<Object[]> findTopProducts(@Param("status") SaleStatus status, Pageable pageable);
}
