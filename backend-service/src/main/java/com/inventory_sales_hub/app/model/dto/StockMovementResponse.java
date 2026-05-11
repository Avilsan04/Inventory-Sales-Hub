package com.inventory_sales_hub.app.model.dto;

import java.time.Instant;

public record StockMovementResponse(
        Long id,
        Long inventoryId,
        String type,
        int quantity,
        int previousStock,
        int newStock,
        String note,
        Instant createdAt
) {}
