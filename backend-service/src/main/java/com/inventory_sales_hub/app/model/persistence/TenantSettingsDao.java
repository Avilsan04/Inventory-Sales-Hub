package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.TenantSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TenantSettingsDao extends JpaRepository<TenantSettings, Long> {
}
