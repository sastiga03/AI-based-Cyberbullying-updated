package com.kce.safeguard.controller;

import com.kce.safeguard.dto.LoginRequest;
import com.kce.safeguard.dto.LoginResponse;
import com.kce.safeguard.dto.RegisterRequest;
import com.kce.safeguard.dto.UserDto;
import com.kce.safeguard.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    @Autowired
    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        LoginResponse response = userService.authenticateUser(loginRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        UserDto registeredUser = userService.registerUser(registerRequest);
        return ResponseEntity.ok(registeredUser);
    }
}
