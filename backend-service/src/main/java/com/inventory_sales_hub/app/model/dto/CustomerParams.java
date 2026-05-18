package com.inventory_sales_hub.app.model.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CustomerParams(
        @NotBlank String name,
        @Email String email,
        String phone
) {}
