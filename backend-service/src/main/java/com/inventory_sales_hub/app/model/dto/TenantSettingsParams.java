package com.inventory_sales_hub.app.model.dto;

public record TenantSettingsParams(
        String companyName,
        String logoUrl,
        String currency,
        String timezone
) {}
