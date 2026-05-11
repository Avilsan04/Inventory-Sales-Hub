package com.inventory_sales_hub.app.model.dto;

import java.math.BigDecimal;

public record SalePeriodStats(BigDecimal revenue, long salesCount, BigDecimal netProfit) {}
