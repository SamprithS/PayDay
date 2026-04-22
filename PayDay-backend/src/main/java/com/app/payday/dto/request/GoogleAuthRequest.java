package com.app.payday.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleAuthRequest {
    @NotBlank
    private String credential; // The JWT token from Google Identity Services
}