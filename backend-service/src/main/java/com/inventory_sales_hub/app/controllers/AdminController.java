package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping(path = "/tenants", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getTenants() {
        return ResponseEntity.ok(adminService.getTenants());
    }

    @GetMapping(path = "/metrics", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMetrics() {
        return ResponseEntity.ok(adminService.getMetrics());
    }

    @PostMapping(path = "/tenants/{id}/activate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> activate(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.activate(id));
    }

    @PostMapping(path = "/tenants/{id}/suspend", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> suspend(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.suspend(id));
    }

    @PostMapping(path = "/tenants/{id}/impersonate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> impersonate(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.impersonate(id));
    }
}
