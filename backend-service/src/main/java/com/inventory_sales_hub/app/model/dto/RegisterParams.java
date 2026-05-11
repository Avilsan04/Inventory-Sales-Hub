package com.inventory_sales_hub.app.model.dto;

public record RegisterParams(
        String username,
        String email,
        String password
) {}
