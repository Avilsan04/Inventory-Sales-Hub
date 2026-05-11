package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record SupplierOrderItemResponse(
        Long productId,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {}
