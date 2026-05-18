package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.dto.CategoryParams;
import com.inventory_sales_hub.app.model.dto.PatchProductParams;
import com.inventory_sales_hub.app.model.dto.ProductParams;
import com.inventory_sales_hub.app.model.service.ProductManager;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/products")
public class ProductController {

    @Autowired
    private ProductManager productManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(productManager.getAll());
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productManager.getById(id));
    }

    @GetMapping(path = "/categories", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(productManager.getCategories());
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> create(@Valid @RequestBody ProductParams params) {
        return new ResponseEntity<>(productManager.create(params), HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody ProductParams params) {
        return ResponseEntity.ok(productManager.update(id, params));
    }

    @PatchMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> patch(@PathVariable Long id, @RequestBody PatchProductParams params) {
        return ResponseEntity.ok(productManager.patch(id, params));
    }

    @DeleteMapping(path = "/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        productManager.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping(path = "/categories", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryParams params) {
        return new ResponseEntity<>(productManager.createCategory(params), HttpStatus.CREATED);
    }
}
