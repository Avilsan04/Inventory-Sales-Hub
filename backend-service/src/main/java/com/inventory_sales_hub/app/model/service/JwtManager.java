package com.inventory_sales_hub.app.model.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import javax.crypto.spec.SecretKeySpec;

@Service
public class JwtManager {
    private static final long ACCESS_TOKEN_EXPIRY_MS = 1000L * 60 * 15;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    private Key secretKey;

    @PostConstruct
    public void init() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        secretKey = new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    public Key getSecretKey() {
        return secretKey;
    }

    public String generateToken(String username, Long id, String role, Long tenantId) {
        var builder = Jwts.builder()
                .setSubject(username)
                .claim("id", id)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + ACCESS_TOKEN_EXPIRY_MS));
        if (tenantId != null) {
            builder.claim("tenantId", tenantId);
        }
        return builder.signWith(secretKey, SignatureAlgorithm.HS256).compact();
    }

    public boolean isTokenValid(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(secretKey).build().parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
