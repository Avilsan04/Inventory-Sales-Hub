package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.exceptions.EmployeeException;
import com.inventory_sales_hub.app.model.dto.CreateEmployeeParams;
import com.inventory_sales_hub.app.model.dto.PatchEmployeeRoleParams;
import com.inventory_sales_hub.app.model.dto.UpdateEmployeeParams;
import com.inventory_sales_hub.app.model.service.EmployeeManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeManager employeeManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll() {
        try {
            return ResponseEntity.ok(employeeManager.getAll());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(employeeManager.getById(id));
        } catch (EmployeeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> create(@RequestBody CreateEmployeeParams params) {
        try {
            return new ResponseEntity<>(employeeManager.create(params), HttpStatus.CREATED);
        } catch (EmployeeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody UpdateEmployeeParams params) {
        try {
            return ResponseEntity.ok(employeeManager.update(id, params));
        } catch (EmployeeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @DeleteMapping(path = "/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        try {
            employeeManager.delete(id);
            return ResponseEntity.ok().build();
        } catch (EmployeeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PatchMapping(path = "/{id}/role", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> patchRole(@PathVariable Long id, @RequestBody PatchEmployeeRoleParams params) {
        try {
            return ResponseEntity.ok(employeeManager.patchRole(id, params));
        } catch (EmployeeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
}
