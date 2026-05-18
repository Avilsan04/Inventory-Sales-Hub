package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.dto.CreateInventoryParams;
import com.inventory_sales_hub.app.model.dto.PatchStockParams;
import com.inventory_sales_hub.app.model.dto.UpdateInventoryParams;
import com.inventory_sales_hub.app.model.service.InventoryManager;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/inventory")
public class InventoryController {

    @Autowired
    private InventoryManager inventoryManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int pageSize,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(inventoryManager.getAll(page, pageSize, search, status));
    }

    @GetMapping(path = "/low-stock", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getLowStock() {
        return ResponseEntity.ok(inventoryManager.getLowStock());
    }

    @GetMapping(path = "/movements", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMovements() {
        return ResponseEntity.ok(inventoryManager.getMovements());
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryManager.getById(id));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> create(@Valid @RequestBody CreateInventoryParams params) {
        return new ResponseEntity<>(inventoryManager.create(params), HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateInventoryParams params) {
        return ResponseEntity.ok(inventoryManager.update(id, params));
    }

    @PatchMapping(path = "/{id}/stock", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody PatchStockParams params) {
        return ResponseEntity.ok(inventoryManager.updateStock(id, params));
    }

    @DeleteMapping(path = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        inventoryManager.delete(id);
        return ResponseEntity.ok().build();
    }
}
