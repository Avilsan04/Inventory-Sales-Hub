package com.inventory_sales_hub.app.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateEmployeeParams(
        @NotBlank @Size(min = 3, max = 50) String username,
        @NotBlank @Email String email
) {}
