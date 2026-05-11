package com.inventory_sales_hub.app.model.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String message;

    private String type;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
