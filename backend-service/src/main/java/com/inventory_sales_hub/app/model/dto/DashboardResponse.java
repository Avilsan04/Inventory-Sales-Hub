package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        BigDecimal revenueToday,
        BigDecimal revenueThisMonth,
        BigDecimal revenueThisYear,
        long salesToday,
        long salesThisMonth,
        long salesThisYear,
        long totalActiveProducts,
        long totalCustomers,
        int lowStockCount,
        BigDecimal totalInventoryValue
) {}
