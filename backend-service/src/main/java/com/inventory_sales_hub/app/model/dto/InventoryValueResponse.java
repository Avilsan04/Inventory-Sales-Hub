package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record InventoryValueResponse(
        BigDecimal totalPurchaseValue,
        BigDecimal totalSaleValue,
        int totalUnits,
        int totalProducts
) {}
