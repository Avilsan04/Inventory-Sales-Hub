package com.inventory_sales_hub.app.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductParams(
        @NotBlank String name,
        String description,
        @NotNull @DecimalMin("0.01") BigDecimal purchasePrice,
        @NotNull @DecimalMin("0.01") BigDecimal salePrice,
        String sku,
        Long categoryId,
        Long supplierId
) {}
