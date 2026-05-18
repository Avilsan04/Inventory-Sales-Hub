package com.inventory_sales_hub.app.model.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.inventory_sales_hub.app.model.dto.AuditLogResponse;
import com.inventory_sales_hub.app.model.entities.AuditAction;
import com.inventory_sales_hub.app.model.entities.AuditEntityType;
import com.inventory_sales_hub.app.model.entities.AuditLog;
import com.inventory_sales_hub.app.model.persistence.AuditLogDao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class AuditService {

    @Autowired
    private AuditLogDao auditLogDao;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void record(Long userId, String userName, AuditAction action,
                       AuditEntityType entityType, String entityId,
                       Object before, Object after, String reason) {
        AuditLog log = new AuditLog();
        log.setUserId(userId);
        log.setUserName(userName);
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setBeforeData(toJson(before));
        log.setAfterData(toJson(after));
        log.setReason(reason);
        auditLogDao.save(log);
    }

    public List<AuditLogResponse> getLogs(String entityTypeParam, String userIdParam) {
        AuditEntityType entityType = entityTypeParam != null
                ? AuditEntityType.valueOf(entityTypeParam.toUpperCase())
                : null;
        Long userId = null;
        if (userIdParam != null) {
            try {
                userId = Long.parseLong(userIdParam);
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException("Invalid userId: " + userIdParam);
            }
        }

        List<AuditLog> logs;
        if (entityType != null && userId != null) {
            logs = auditLogDao.findByEntityTypeAndUserIdOrderByTimestampDesc(entityType, userId);
        } else if (entityType != null) {
            logs = auditLogDao.findByEntityTypeOrderByTimestampDesc(entityType);
        } else if (userId != null) {
            logs = auditLogDao.findByUserIdOrderByTimestampDesc(userId);
        } else {
            logs = auditLogDao.findAllByOrderByTimestampDesc();
        }

        return logs.stream().map(this::toResponse).toList();
    }

    private AuditLogResponse toResponse(AuditLog log) {
        return new AuditLogResponse(
                String.valueOf(log.getId()),
                String.valueOf(log.getUserId()),
                log.getUserName(),
                log.getAction().name().toLowerCase(),
                log.getEntityType().name().toLowerCase(),
                log.getEntityId(),
                fromJson(log.getBeforeData()),
                fromJson(log.getAfterData()),
                log.getReason(),
                log.getTimestamp().toString()
        );
    }

    private String toJson(Object obj) {
        if (obj == null) return null;
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (JsonProcessingException e) {
            return null;
        }
    }

    private Map<String, Object> fromJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
