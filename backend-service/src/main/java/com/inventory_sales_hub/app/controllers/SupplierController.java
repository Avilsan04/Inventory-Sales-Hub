package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.exceptions.SupplierException;
import com.inventory_sales_hub.app.model.dto.CreateSupplierOrderParams;
import com.inventory_sales_hub.app.model.dto.SupplierParams;
import com.inventory_sales_hub.app.model.service.SupplierManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/suppliers")
public class SupplierController {

    @Autowired
    private SupplierManager supplierManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int size,
            @RequestParam(required = false) String search) {
        try {
            return ResponseEntity.ok(supplierManager.getAllPaginated(page, size, search));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(supplierManager.getById(id));
        } catch (SupplierException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/{id}/products", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getProducts(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(supplierManager.getProducts(id));
        } catch (SupplierException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@RequestBody SupplierParams params) {
        try {
            return new ResponseEntity<>(supplierManager.create(params), HttpStatus.CREATED);
        } catch (SupplierException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SupplierParams params) {
        try {
            return ResponseEntity.ok(supplierManager.update(id, params));
        } catch (SupplierException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            supplierManager.delete(id);
            return ResponseEntity.ok().build();
        } catch (SupplierException e) {
            String msg = e.getMessage();
            if (msg != null && msg.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(msg);
            }
            return ResponseEntity.status(HttpStatus.CONFLICT).body(msg);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/{supplierId}/orders", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createOrder(@PathVariable Long supplierId, @RequestBody CreateSupplierOrderParams params) {
        try {
            return new ResponseEntity<>(supplierManager.createOrder(supplierId, params), HttpStatus.CREATED);
        } catch (SupplierException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
