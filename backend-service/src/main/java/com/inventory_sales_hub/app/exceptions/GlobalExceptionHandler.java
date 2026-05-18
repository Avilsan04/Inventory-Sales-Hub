package com.inventory_sales_hub.app.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ErrorResponse(String code, String message) {}
    public record ValidationErrorResponse(String code, Map<String, String> errors) {}

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationErrorResponse> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        e -> e.getDefaultMessage() != null ? e.getDefaultMessage() : "Invalid",
                        (a, b) -> a
                ));
        return ResponseEntity.badRequest()
                .body(new ValidationErrorResponse("VALIDATION_ERROR", errors));
    }

    @ExceptionHandler({UserException.class, CustomerException.class, EmployeeException.class})
    public ResponseEntity<ErrorResponse> handleUserDomain(RuntimeException ex) {
        return ResponseEntity.badRequest().body(new ErrorResponse("DOMAIN_ERROR", ex.getMessage()));
    }

    @ExceptionHandler({ProductException.class, InventoryException.class})
    public ResponseEntity<ErrorResponse> handleProductDomain(RuntimeException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("NOT_FOUND", msg));
        }
        return ResponseEntity.badRequest().body(new ErrorResponse("DOMAIN_ERROR", msg));
    }

    @ExceptionHandler(SaleException.class)
    public ResponseEntity<ErrorResponse> handleSale(SaleException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("NOT_FOUND", msg));
        }
        return ResponseEntity.badRequest().body(new ErrorResponse("SALE_ERROR", msg));
    }

    @ExceptionHandler(SupplierException.class)
    public ResponseEntity<ErrorResponse> handleSupplier(SupplierException ex) {
        String msg = ex.getMessage();
        if (msg != null && msg.contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("NOT_FOUND", msg));
        }
        if (msg != null && msg.contains("Cannot delete")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorResponse("CONFLICT", msg));
        }
        return ResponseEntity.badRequest().body(new ErrorResponse("DOMAIN_ERROR", msg));
    }

    @ExceptionHandler(NotificationException.class)
    public ResponseEntity<ErrorResponse> handleNotification(NotificationException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("FORBIDDEN", "Access denied"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        log.error("Unhandled exception", ex);
        return ResponseEntity.internalServerError().body(new ErrorResponse("INTERNAL_ERROR", "An unexpected error occurred"));
    }
}
