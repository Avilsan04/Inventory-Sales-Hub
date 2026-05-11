package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record SupplierOrderItemParams(Long productId, int quantity, BigDecimal unitPrice) {}
