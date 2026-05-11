package com.inventory_sales_hub.app.model.dto;

import java.util.List;

public record CreateSaleParams(Long customerId, List<SaleItemParams> items) {}
