package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.dto.CreateSaleParams;
import com.inventory_sales_hub.app.model.dto.PatchSaleStatusParams;
import com.inventory_sales_hub.app.model.service.SaleManager;
import jakarta.validation.Valid;
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
        Instant from = dateFrom != null ? dateFrom.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant to   = dateTo   != null ? dateTo.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        return ResponseEntity.ok(saleManager.getAllPaginated(page, size, search, from, to));
    }

    @GetMapping(path = "/my-orders", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMyOrders(@AuthenticationPrincipal Jwt jwt) {
        Number userId = jwt.getClaim("id");
        return ResponseEntity.ok(saleManager.getMyOrders(userId.longValue()));
    }

    @GetMapping(path = "/summary", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getSummary() {
        return ResponseEntity.ok(saleManager.getSummary());
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(saleManager.getById(id));
    }

    @GetMapping(path = "/{id}/items", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getItems(@PathVariable Long id) {
        return ResponseEntity.ok(saleManager.getItems(id));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody CreateSaleParams params) {
        Number userId = jwt.getClaim("id");
        return new ResponseEntity<>(saleManager.create(params, userId.longValue()), HttpStatus.CREATED);
    }

    @PatchMapping(path = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody PatchSaleStatusParams params) {
        return ResponseEntity.ok(saleManager.updateStatus(id, params));
    }
}
