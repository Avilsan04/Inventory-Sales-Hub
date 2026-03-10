package com.inventory_sales_hub.app.model.dto;

public record UserResponse(
        Long id,
        String username,
        String email,
        String token
) {}
