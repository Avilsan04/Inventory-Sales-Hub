package com.inventory_sales_hub.app.model.dto;

public record ResetPasswordParams(
        String token,
        String newPassword
) {}
