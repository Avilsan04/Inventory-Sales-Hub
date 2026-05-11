package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record SaleResponse(
        Long id,
        CustomerResponse customer,
        String processedBy,
        String status,
        BigDecimal subtotal,
        BigDecimal taxRate,
        BigDecimal taxAmount,
        BigDecimal total,
        Instant createdAt,
        Instant updatedAt,
        List<SaleItemResponse> items
) {}
