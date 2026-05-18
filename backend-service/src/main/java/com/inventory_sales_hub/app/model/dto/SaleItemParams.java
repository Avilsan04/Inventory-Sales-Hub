package com.inventory_sales_hub.app.model.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SaleItemParams(
        @NotNull Long productId,
        @Min(1) int quantity
) {}
