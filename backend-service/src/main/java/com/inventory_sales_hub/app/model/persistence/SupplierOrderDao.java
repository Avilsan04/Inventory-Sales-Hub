package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Supplier;
import com.inventory_sales_hub.app.model.entities.SupplierOrder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupplierOrderDao extends JpaRepository<SupplierOrder, Long> {
    boolean existsBySupplier(Supplier supplier);
}
