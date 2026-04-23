package com.app.payday.controller;

import com.app.payday.dto.request.GoogleAuthRequest;
import com.app.payday.dto.response.ApiResponse;
import com.app.payday.dto.response.AuthResponse;
import com.app.payday.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleSignIn(
            @Valid @RequestBody GoogleAuthRequest request,
            @RequestHeader(value = "X-Google-Access-Token", required = false) String googleAccessToken) {

        AuthResponse response = authService.signInWithGoogle(request, googleAccessToken);
        return ResponseEntity.ok(ApiResponse.ok("Signed in successfully", response));
    }
}