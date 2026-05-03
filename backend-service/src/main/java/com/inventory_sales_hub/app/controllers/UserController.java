package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.exceptions.UserException;
import com.inventory_sales_hub.app.model.dto.*;
import com.inventory_sales_hub.app.model.service.UserManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api/auth")
public class UserController {
    @Autowired
    private UserManager userManager;

    @RequestMapping(
            value = {"/signup", "/register"},
            method = RequestMethod.POST,
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> registerUser(@RequestBody RegisterParams params) {
        try {
            return new ResponseEntity<>(userManager.registerUser(params), HttpStatus.CREATED);
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/login", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> loginUser(@RequestBody LoginParams params) {
        try {
            return ResponseEntity.ok(userManager.loginUser(params.email(), params.password()));
        } catch (UserException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @PostMapping(path = "/logout", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> logout(@RequestBody RefreshParams params) {
        try {
            userManager.logout(params.refreshToken());
            return ResponseEntity.ok().build();
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

    @PostMapping(path = "/refresh", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> refreshToken(@RequestBody RefreshParams params) {
        try {
            return ResponseEntity.ok(userManager.refreshToken(params.refreshToken()));
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
}