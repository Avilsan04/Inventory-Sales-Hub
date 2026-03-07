package com.inventorysaleshub.user.domain.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * PURE DOMAIN ENTITY
 * Absolutely NO Spring, JPA, or Database annotations are allowed here.
 */
@Getter
@Setter
@Builder
@AllArgsConstructor
public class User {
    private Long id;
    private String username;
    private String email;
    private String password;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Business logic methods can be added here (e.g., lockAccount(), updateEmail())
    public void deactivate() {
        this.isActive = false;
    }
}