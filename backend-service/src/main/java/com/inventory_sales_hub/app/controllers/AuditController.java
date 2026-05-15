package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/audit")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String userId) {
        try {
            return ResponseEntity.ok(auditService.getLogs(entityType, userId));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
