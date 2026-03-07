package com.inventorysaleshub.user.infrastructure.rest.controllers;

import com.inventorysaleshub.user.application.ports.inbound.LoginUserPort;
import com.inventorysaleshub.user.application.ports.inbound.RegisterUserPort;
import com.inventorysaleshub.user.application.ports.outbound.TokenProviderPort;
import com.inventorysaleshub.user.domain.entities.User;
import com.inventorysaleshub.user.infrastructure.rest.dto.LoginRequest;
import com.inventorysaleshub.user.infrastructure.rest.dto.RegisterRequest;
import com.inventorysaleshub.user.infrastructure.rest.dto.UserResponse;
import com.inventorysaleshub.user.infrastructure.rest.mappers.UserRestMapper;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final RegisterUserPort registerUserPort;
    private final LoginUserPort loginUserPort;
    private final TokenProviderPort tokenProvider;
    private final UserRestMapper userMapper;

    public AuthController(RegisterUserPort registerUserPort,
                          LoginUserPort loginUserPort,
                          TokenProviderPort tokenProvider,
                          UserRestMapper userMapper) {
        this.registerUserPort = registerUserPort;
        this.loginUserPort = loginUserPort;
        this.tokenProvider = tokenProvider;
        this.userMapper = userMapper;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        User user = registerUserPort.register(request.username(), request.email(), request.password());
        String token = tokenProvider.generateToken(user.getUsername(), user.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toResponseWithToken(user, token));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUser(@Valid @RequestBody LoginRequest request) {
        String token = loginUserPort.login(request.email(), request.password());
        return ResponseEntity.ok(Map.of("token", token));
    }
}
