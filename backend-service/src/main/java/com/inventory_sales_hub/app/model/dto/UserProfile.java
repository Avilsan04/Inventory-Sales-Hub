package com.inventory_sales_hub.app.model.dto;

public record UserProfile(
        Long id,
        String username,
        String email,
        String role
) {}
