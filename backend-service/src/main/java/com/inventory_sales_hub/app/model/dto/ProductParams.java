package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record ProductParams(
        String name,
        String description,
        BigDecimal price,
        String sku,
        Long categoryId
) {}
