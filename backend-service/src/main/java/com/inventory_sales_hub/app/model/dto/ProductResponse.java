package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String sku,
        CategoryResponse category
) {}
