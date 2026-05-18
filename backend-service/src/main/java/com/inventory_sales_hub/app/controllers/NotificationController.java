package com.inventory_sales_hub.app.controllers;

import com.inventory_sales_hub.app.model.service.NotificationManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/notifications")
public class NotificationController {

    @Autowired
    private NotificationManager notificationManager;

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAll(@AuthenticationPrincipal Jwt jwt) {
        Number userId = jwt.getClaim("id");
        return ResponseEntity.ok(notificationManager.getForUser(userId.longValue()));
    }

    @PatchMapping(path = "/{id}/read", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> markRead(@PathVariable Long id, @AuthenticationPrincipal Jwt jwt) {
        Number userId = jwt.getClaim("id");
        return ResponseEntity.ok(notificationManager.markRead(id, userId.longValue()));
    }

    @PatchMapping(path = "/read-all")
    public ResponseEntity<?> markAllRead(@AuthenticationPrincipal Jwt jwt) {
        Number userId = jwt.getClaim("id");
        notificationManager.markAllRead(userId.longValue());
        return ResponseEntity.ok().build();
    }
}
