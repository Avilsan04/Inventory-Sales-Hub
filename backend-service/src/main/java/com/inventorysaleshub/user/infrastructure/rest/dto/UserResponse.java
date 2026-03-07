package com.inventorysaleshub.user.infrastructure.rest.dto;

public record UserResponse(
        Long id,
        String username,
        String email,
        String token
) {
}
