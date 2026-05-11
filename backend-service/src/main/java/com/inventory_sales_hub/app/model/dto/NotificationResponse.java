package com.inventory_sales_hub.app.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        String message,
        String type,
        @JsonProperty("is_read") boolean read,
        LocalDateTime createdAt
) {}
