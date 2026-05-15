package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.exceptions.SaleException;
import com.inventory_sales_hub.app.model.dto.CreateSaleParams;
import com.inventory_sales_hub.app.model.dto.PatchSaleStatusParams;
import com.inventory_sales_hub.app.model.service.SaleManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;

@RestController
@RequestMapping("api/sales")
public class SaleController {
    @Autowired
    private SaleManager saleManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        try {
            Instant from = dateFrom != null ? dateFrom.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
            Instant to   = dateTo   != null ? dateTo.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
            return ResponseEntity.ok(saleManager.getAllPaginated(page, size, search, from, to));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/my-orders", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        try {
            Number userId = jwt.getClaim("id");
            return ResponseEntity.ok(saleManager.getMyOrders(userId.longValue()));
        } catch (SaleException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
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
