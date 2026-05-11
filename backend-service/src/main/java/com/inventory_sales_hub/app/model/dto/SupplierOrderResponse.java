package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record SupplierOrderResponse(
        Long id,
        Long supplierId,
        String supplierName,
        String status,
        BigDecimal totalAmount,
        List<SupplierOrderItemResponse> items,
        LocalDateTime createdAt
) {}
