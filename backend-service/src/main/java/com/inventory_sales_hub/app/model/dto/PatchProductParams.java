package com.inventory_sales_hub.app.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record PatchProductParams(
        @JsonProperty("is_active") Boolean active
) {}
