package com.inventory_sales_hub.app.model.entities;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "suppliers")
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column
    private String email;

    private String phone;
    private String address;

    @Column(name = "tenant_id", nullable = false)
    private Long tenantId;
}
