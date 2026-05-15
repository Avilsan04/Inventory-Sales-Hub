package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping(path = "/tenants", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getTenants() {
        try {
            return ResponseEntity.ok(adminService.getTenants());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/metrics", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMetrics() {
        try {
            return ResponseEntity.ok(adminService.getMetrics());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/tenants/{id}/activate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> activate(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.activate(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/tenants/{id}/suspend", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> suspend(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.suspend(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/tenants/{id}/impersonate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> impersonate(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(adminService.impersonate(id));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
