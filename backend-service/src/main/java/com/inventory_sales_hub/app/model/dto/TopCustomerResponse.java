package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record TopCustomerResponse(Long customerId, String customerName, long ordersCount, BigDecimal totalSpent) {}
