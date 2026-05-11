package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record CreateInventoryParams(
        String name,
        String description,
        BigDecimal purchasePrice,
        BigDecimal salePrice,
        String sku,
        Long categoryId,
        int quantity,
        Integer minStock
) {}
