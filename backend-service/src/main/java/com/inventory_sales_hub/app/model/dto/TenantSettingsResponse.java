package com.inventory_sales_hub.app.model.dto;

public record TenantSettingsResponse(
        String companyName,
        String logoUrl,
        String currency,
        String timezone
) {}
