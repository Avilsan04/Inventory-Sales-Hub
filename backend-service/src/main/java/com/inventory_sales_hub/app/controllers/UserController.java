package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.service.UserManager;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
public class UserController {

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Autowired
    private UserManager userManager;

    @PostMapping(
            value = {"/signup", "/register"},
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterParams params) {
        UserResponse result = userManager.registerUser(params);
        return ResponseEntity.status(HttpStatus.CREATED)
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
                .body(toBody(result));
    }

    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginParams params) {
        UserResponse result = userManager.loginUser(params.email(), params.password());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
                .body(toBody(result));
    }

    @PostMapping(path = "/logout")
    public ResponseEntity<?> logout(@CookieValue(value = "refresh_token", required = false) String refreshToken) {
        if (refreshToken != null) userManager.logout(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .build();
    }

    @GetMapping(path = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMe(@AuthenticationPrincipal Jwt jwt) {
        Number id = jwt.getClaim("id");
        return ResponseEntity.ok(userManager.getMe(id.longValue()));
    }

    @PostMapping(path = "/refresh", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refresh_token", required = false) String refreshToken) {
        if (refreshToken == null) return ResponseEntity.badRequest().body(Map.of("code", "MISSING_TOKEN", "message", "Missing refresh token"));
        UserResponse result = userManager.refreshToken(refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
                .body(toBody(result));
    }

    @PostMapping(path = "/forgot-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordParams params) {
        userManager.forgotPassword(params.email());
        return ResponseEntity.ok().build();
    }

    @PostMapping(path = "/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordParams params) {
        userManager.resetPassword(params.token(), params.newPassword());
        return ResponseEntity.ok().build();
    }

    @PatchMapping(path = "/me", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody UpdateProfileParams params) {
        Number id = jwt.getClaim("id");
        return ResponseEntity.ok(userManager.updateProfile(id.longValue(), params));
    }

    @DeleteMapping(path = "/me")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal Jwt jwt) {
        Number id = jwt.getClaim("id");
        userManager.deleteCurrentUser(id.longValue());
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .build();
    }

    @PatchMapping(path = "/me/password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody ChangePasswordParams params) {
        Number id = jwt.getClaim("id");
        userManager.changePassword(id.longValue(), params.currentPassword(), params.newPassword());
        return ResponseEntity.ok().build();
    }

    private ResponseCookie buildRefreshCookie(String token) {
        return ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(Duration.ofDays(7))
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }

    private Map<String, Object> toBody(UserResponse r) {
        return Map.of("id", r.id(), "username", r.username(), "email", r.email(), "role", r.role(), "accessToken", r.accessToken());
    }
}
