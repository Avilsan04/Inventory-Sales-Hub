package com.inventory_sales_hub.app.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateInventoryParams(
        @NotBlank String name,
        String description,
        @NotNull @DecimalMin("0.01") BigDecimal purchasePrice,
        @NotNull @DecimalMin("0.01") BigDecimal salePrice,
        String sku,
        Long categoryId,
        @Min(0) int quantity,
        @Min(0) Integer minStock
) {}
