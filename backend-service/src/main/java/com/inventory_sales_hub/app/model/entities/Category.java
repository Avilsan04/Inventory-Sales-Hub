package com.inventory_sales_hub.app.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(
    name = "categories",
    uniqueConstraints = @UniqueConstraint(name = "uq_category_name_tenant", columnNames = {"name", "tenant_id"})
)
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
}
