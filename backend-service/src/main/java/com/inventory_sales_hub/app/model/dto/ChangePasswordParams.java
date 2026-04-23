package com.inventory_sales_hub.app.model.dto;

public record ChangePasswordParams(
        String currentPassword,
        String newPassword
) {}
