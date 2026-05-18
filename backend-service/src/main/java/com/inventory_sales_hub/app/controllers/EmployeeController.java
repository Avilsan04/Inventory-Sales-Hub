package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.config.TenantContext;
import com.inventory_sales_hub.app.model.dto.CreateEmployeeParams;
import com.inventory_sales_hub.app.model.dto.PatchEmployeeRoleParams;
import com.inventory_sales_hub.app.model.dto.UpdateEmployeeParams;
import com.inventory_sales_hub.app.model.service.EmployeeManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/employees")
@PreAuthorize("hasAnyRole('ADMIN','COMPANY','MANAGER')")
public class EmployeeController {

    @Autowired private EmployeeManager employeeManager;
    @Autowired private TenantContext tenantContext;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(employeeManager.getAll(tenantContext.currentTenantId(), page, size));
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeManager.getById(id, tenantContext.currentTenantId()));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@RequestBody CreateEmployeeParams params) {
        return new ResponseEntity<>(
                employeeManager.create(params, tenantContext.currentTenantId()),
                HttpStatus.CREATED);
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateEmployeeParams params) {
        return ResponseEntity.ok(employeeManager.update(id, params, tenantContext.currentTenantId()));
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        employeeManager.delete(id, tenantContext.currentTenantId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping(path = "/{id}/role", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> patchRole(@PathVariable Long id, @RequestBody PatchEmployeeRoleParams params) {
        return ResponseEntity.ok(employeeManager.patchRole(id, params, tenantContext.currentTenantId()));
    }
}
