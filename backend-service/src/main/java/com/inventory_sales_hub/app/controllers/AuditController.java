package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.service.AuditService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/audit")
@PreAuthorize("hasAnyRole('ADMIN','COMPANY')")
public class AuditController {

    @Autowired
    private AuditService auditService;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getLogs(
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String userId) {
        return ResponseEntity.ok(auditService.getLogs(entityType, userId));
    }
}
