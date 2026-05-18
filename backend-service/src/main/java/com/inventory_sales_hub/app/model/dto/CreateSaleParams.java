package com.inventory_sales_hub.app.model.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreateSaleParams(
        Long customerId,
        @NotEmpty @Valid List<SaleItemParams> items
) {}
