package com.inventory_sales_hub.app.model.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record AuditLogResponse(
        String id,
        String userId,
        String userName,
        String action,
        String entityType,
        String entityId,
        Map<String, Object> before,
        Map<String, Object> after,
        String reason,
        String timestamp
) {}
