package com.inventory_sales_hub.app.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal purchasePrice,
        BigDecimal salePrice,
        String sku,
        CategoryResponse category,
        @JsonProperty("supplier_id") Long supplierId,
        @JsonProperty("supplier_name") String supplierName,
        @JsonProperty("is_active") boolean active
) {}
