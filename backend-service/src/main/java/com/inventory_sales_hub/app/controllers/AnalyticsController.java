package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.service.AnalyticsManager;
import com.inventory_sales_hub.app.model.service.SaleManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("api/analytics")
public class AnalyticsController {

    @Autowired private AnalyticsManager analyticsManager;
    @Autowired private SaleManager saleManager;

    @GetMapping(path = "/recent-sales", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getRecentSales(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(saleManager.getRecent(limit));
    }

    @GetMapping(path = "/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(analyticsManager.getDashboard());
    }

    @GetMapping(path = "/sales", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getSales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        LocalDate resolvedEnd   = end   != null ? end   : LocalDate.now();
        LocalDate resolvedStart = start != null ? start : resolvedEnd.minusDays(29);
        return ResponseEntity.ok(analyticsManager.getSalesAnalytics(resolvedStart, resolvedEnd));
    }

    @GetMapping(path = "/top-products", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getTopProducts(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(analyticsManager.getTopProducts(limit));
    }

    @GetMapping(path = "/top-customers", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getTopCustomers(@RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(analyticsManager.getTopCustomers(limit));
    }

    @GetMapping(path = "/inventory-value", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getInventoryValue() {
        return ResponseEntity.ok(analyticsManager.getInventoryValue());
    }

    @GetMapping(path = "/low-stock-alerts", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getLowStockAlerts() {
        return ResponseEntity.ok(analyticsManager.getLowStockAlerts());
    }
}
