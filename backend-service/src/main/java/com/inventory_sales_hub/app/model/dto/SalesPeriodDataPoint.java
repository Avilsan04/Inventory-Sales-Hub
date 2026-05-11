package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SalesPeriodDataPoint(LocalDate date, BigDecimal revenue, long ordersCount) {}
