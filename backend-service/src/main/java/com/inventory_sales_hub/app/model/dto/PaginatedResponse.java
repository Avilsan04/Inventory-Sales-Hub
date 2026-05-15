package com.inventory_sales_hub.app.model.dto;

import java.util.List;

public record PaginatedResponse<T>(List<T> data, long total, int page, int pageSize) {}
