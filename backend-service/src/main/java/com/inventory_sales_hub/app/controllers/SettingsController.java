package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.dto.TenantSettingsParams;
import com.inventory_sales_hub.app.model.service.SettingsManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/settings")
public class SettingsController {
    @Autowired
    private SettingsManager settingsManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getSettings() {
        try {
            return ResponseEntity.ok(settingsManager.getSettings());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateSettings(@RequestBody TenantSettingsParams params) {
        try {
            return ResponseEntity.ok(settingsManager.updateSettings(params));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
