package com.inventory_sales_hub.app.model.dto;

public record AdminMetricsResponse(
        long totalTenants,
        long activeTenants,
        long suspendedTenants,
        long totalRevenueMrr
) {}
