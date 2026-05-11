package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.SupplierOrder;
import com.inventory_sales_hub.app.model.entities.SupplierOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplierOrderItemDao extends JpaRepository<SupplierOrderItem, Long> {
    @Query("SELECT oi FROM SupplierOrderItem oi JOIN FETCH oi.product p LEFT JOIN FETCH p.category WHERE oi.order IN :orders")
    List<SupplierOrderItem> findByOrdersWithProduct(@Param("orders") List<SupplierOrder> orders);
}
