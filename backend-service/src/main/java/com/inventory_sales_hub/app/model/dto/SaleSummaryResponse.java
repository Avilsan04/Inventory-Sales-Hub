package com.inventory_sales_hub.app.model.dto;

import java.util.List;

public record SaleSummaryResponse(
        SalePeriodStats today,
        SalePeriodStats month,
        List<TopProductResponse> topProducts
) {}
