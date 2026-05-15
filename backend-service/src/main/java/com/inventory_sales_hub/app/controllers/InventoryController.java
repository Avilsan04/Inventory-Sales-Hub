package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.exceptions.InventoryException;
import com.inventory_sales_hub.app.model.dto.CreateInventoryParams;
import com.inventory_sales_hub.app.model.dto.PatchStockParams;
import com.inventory_sales_hub.app.model.dto.UpdateInventoryParams;
import com.inventory_sales_hub.app.model.service.InventoryManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
        try {
            return ResponseEntity.ok(inventoryManager.getAll(page, pageSize, search, status));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/low-stock", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getLowStock() {
        try {
            return ResponseEntity.ok(inventoryManager.getLowStock());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/movements", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMovements() {
        try {
            return ResponseEntity.ok(inventoryManager.getMovements());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(inventoryManager.getById(id));
        } catch (InventoryException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@RequestBody CreateInventoryParams params) {
        try {
            return new ResponseEntity<>(inventoryManager.create(params), HttpStatus.CREATED);
        } catch (InventoryException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateInventoryParams params) {
        try {
            return ResponseEntity.ok(inventoryManager.update(id, params));
        } catch (InventoryException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PatchMapping(path = "/{id}/stock", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody PatchStockParams params) {
        try {
            return ResponseEntity.ok(inventoryManager.updateStock(id, params));
        } catch (InventoryException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            inventoryManager.delete(id);
            return ResponseEntity.ok().build();
        } catch (InventoryException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
