package com.inventory_sales_hub.app.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record InventoryResponse(
        Long id,
        ProductResponse product,
        int quantity,
        int minStock,
        @JsonProperty("is_low_stock") boolean lowStock
) {}
