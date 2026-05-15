package com.inventory_sales_hub.app.model.dto;

public record TenantResponse(
        String id,
        String name,
        String plan,
        String status,
        String createdAt,
        String ownerEmail,
        int userCount
) {}
