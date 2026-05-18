package com.inventory_sales_hub.app.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/**
 * Reads tenant context from the current JWT in SecurityContextHolder.
 * Null tenantId means the requesting user is ADMIN (global access, no tenant isolation).
 */
@Service
public class TenantContext {

    public Long currentTenantId() {
        Jwt jwt = currentJwt();
        if (jwt == null) return null;
        Number tenantId = jwt.getClaim("tenantId");
        return tenantId != null ? tenantId.longValue() : null;
    }

    public boolean isAdmin() {
        Jwt jwt = currentJwt();
        return jwt != null && "ADMIN".equals(jwt.getClaim("role"));
    }

    public Long currentUserId() {
        Jwt jwt = currentJwt();
        if (jwt == null) return null;
        Number id = jwt.getClaim("id");
        return id != null ? id.longValue() : null;
    }

    private Jwt currentJwt() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) return null;
        return jwt;
    }
}
