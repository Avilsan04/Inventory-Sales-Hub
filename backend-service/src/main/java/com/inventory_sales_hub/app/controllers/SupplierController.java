package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.dto.CreateSupplierOrderParams;
import com.inventory_sales_hub.app.model.dto.SupplierParams;
import com.inventory_sales_hub.app.model.service.SupplierManager;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/suppliers")
@PreAuthorize("hasAnyRole('ADMIN','COMPANY','MANAGER')")
public class SupplierController {

    @Autowired
    private SupplierManager supplierManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "200") int size,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(supplierManager.getAllPaginated(page, size, search));
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierManager.getById(id));
    }

    @GetMapping(path = "/{id}/products", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getProducts(@PathVariable Long id) {
        return ResponseEntity.ok(supplierManager.getProducts(id));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@Valid @RequestBody SupplierParams params) {
        return new ResponseEntity<>(supplierManager.create(params), HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody SupplierParams params) {
        return ResponseEntity.ok(supplierManager.update(id, params));
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        supplierManager.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(path = "/{supplierId}/orders", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createOrder(@PathVariable Long supplierId, @RequestBody CreateSupplierOrderParams params) {
        return new ResponseEntity<>(supplierManager.createOrder(supplierId, params), HttpStatus.CREATED);
    }
}
