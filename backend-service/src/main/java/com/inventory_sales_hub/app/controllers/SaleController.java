package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.exceptions.SaleException;
import com.inventory_sales_hub.app.model.dto.CreateSaleParams;
import com.inventory_sales_hub.app.model.dto.PatchSaleStatusParams;
import com.inventory_sales_hub.app.model.service.SaleManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/sales")
public class SaleController {
    @Autowired
    private SaleManager saleManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll() {
        try {
            return ResponseEntity.ok(saleManager.getAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/summary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getSummary() {
        try {
            return ResponseEntity.ok(saleManager.getSummary());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(saleManager.getById(id));
        } catch (SaleException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/{id}/items", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getItems(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(saleManager.getItems(id));
        } catch (SaleException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@AuthenticationPrincipal Jwt jwt, @RequestBody CreateSaleParams params) {
        try {
            Number userId = jwt.getClaim("id");
            return new ResponseEntity<>(saleManager.create(params, userId.longValue()), HttpStatus.CREATED);
        } catch (SaleException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody PatchSaleStatusParams params) {
        try {
            return ResponseEntity.ok(saleManager.updateStatus(id, params));
        } catch (SaleException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
