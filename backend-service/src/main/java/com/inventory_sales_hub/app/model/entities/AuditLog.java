package com.inventory_sales_hub.app.model.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.Instant;

@Data
@Entity
@Table(name = "audit_logs")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String userName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditAction action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuditEntityType entityType;

    @Column(nullable = false)
    private String entityId;

    @Column(columnDefinition = "TEXT")
    private String beforeData;

    @Column(columnDefinition = "TEXT")
    private String afterData;

    @Column
    private String reason;

    @Column(nullable = false, updatable = false)
    private Instant timestamp = Instant.now();
}
