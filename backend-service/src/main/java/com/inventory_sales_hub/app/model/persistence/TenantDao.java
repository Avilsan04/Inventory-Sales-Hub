package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.Tenant;
import com.inventory_sales_hub.app.model.entities.TenantStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantDao extends JpaRepository<Tenant, Long> {
    long countByStatus(TenantStatus status);
}
