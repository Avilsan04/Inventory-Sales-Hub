package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.exceptions.UserException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.service.UserManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("api/auth")
public class UserController {
    @Autowired
    private UserManager userManager;

    @PostMapping(
            value = {"/signup", "/register"},
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> registerUser(@RequestBody RegisterParams params) {
        try {
            UserResponse result = userManager.registerUser(params);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
                    .body(toBody(result));
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginUser(@RequestBody LoginParams params) {
        try {
            UserResponse result = userManager.loginUser(params.email(), params.password());
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
                    .body(toBody(result));
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/logout")
    public ResponseEntity<?> logout(@CookieValue(value = "refresh_token", required = false) String refreshToken) {
        try {
            if (refreshToken != null) userManager.logout(refreshToken);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                    .build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping(path = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getMe(@AuthenticationPrincipal Jwt jwt) {
        try {
            Number id = jwt.getClaim("id");
            return ResponseEntity.ok(userManager.getMe(id.longValue()));
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/refresh", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> refreshToken(@CookieValue(value = "refresh_token", required = false) String refreshToken) {
        try {
            if (refreshToken == null) return ResponseEntity.badRequest().body("Missing refresh token");
            UserResponse result = userManager.refreshToken(refreshToken);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, buildRefreshCookie(result.refreshToken()).toString())
                    .body(toBody(result));
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/forgot-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordParams params) {
        try {
            userManager.forgotPassword(params.email());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/reset-password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordParams params) {
        try {
            userManager.resetPassword(params.token(), params.newPassword());
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PatchMapping(path = "/me", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal Jwt jwt, @RequestBody UpdateProfileParams params) {
        try {
            Number id = jwt.getClaim("id");
            return ResponseEntity.ok(userManager.updateProfile(id.longValue(), params));
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PatchMapping(path = "/me/password", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> changePassword(@AuthenticationPrincipal Jwt jwt, @RequestBody ChangePasswordParams params) {
        try {
            Number id = jwt.getClaim("id");
            userManager.changePassword(id.longValue(), params.currentPassword(), params.newPassword());
            return ResponseEntity.ok().build();
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    private ResponseCookie buildRefreshCookie(String token) {
        return ResponseCookie.from("refresh_token", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(Duration.ofDays(7))
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from("refresh_token", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth")
                .maxAge(0)
                .build();
    }

    private Map<String, Object> toBody(UserResponse r) {
        return Map.of("id", r.id(), "username", r.username(), "email", r.email(), "role", r.role(), "accessToken", r.accessToken());
    }
}
