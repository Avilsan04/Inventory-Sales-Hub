package com.inventory_sales_hub.app.model.persistence;

import com.inventory_sales_hub.app.model.entities.AuditEntityType;
import com.inventory_sales_hub.app.model.entities.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogDao extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findAllByOrderByTimestampDesc();

    List<AuditLog> findByEntityTypeOrderByTimestampDesc(AuditEntityType entityType);

    List<AuditLog> findByUserIdOrderByTimestampDesc(Long userId);

    List<AuditLog> findByEntityTypeAndUserIdOrderByTimestampDesc(AuditEntityType entityType, Long userId);
}
