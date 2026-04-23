package com.app.payday.service;

import com.app.payday.dto.request.GoogleAuthRequest;
import com.app.payday.dto.response.AuthResponse;
import com.app.payday.entity.User;
import com.app.payday.repository.UserRepository;
import com.app.payday.utility.GoogleTokenVerifier;
import com.app.payday.utility.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final GoogleDriveService driveService;
    private final JwtUtil jwtUtil;

    public AuthResponse signInWithGoogle(GoogleAuthRequest request, String googleAccessToken) {
        // 1. Verify the Google ID token
        GoogleIdToken.Payload payload = googleTokenVerifier.verify(request.getCredential());

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String picture = (String) payload.get("picture");

        // 2. Find or create user
        User user = userRepository.findByGoogleId(googleId).orElseGet(() -> {
            log.info("New user signing in: {}", email);
            return User.builder()
                    .googleId(googleId)
                    .email(email)
                    .name(name)
                    .picture(picture)
                    .build();
        });

        // Update profile info in case it changed
        user.setName(name);
        user.setPicture(picture);

        // 3. Create bills_payday Drive folder if not already done
        if (user.getDriveFolderId() == null && googleAccessToken != null) {
            try {
                String folderId = driveService.getOrCreateBillsFolder(googleAccessToken);
                user.setDriveFolderId(folderId);
                log.info("Set Drive folder for user {}: {}", email, folderId);
            } catch (Exception e) {
                log.warn("Could not create Drive folder for {}: {}", email, e.getMessage());
                // Don't fail auth just because Drive folder failed
            }
        }

        user = userRepository.save(user);

        // 4. Generate our own JWT
        String token = jwtUtil.generateToken(googleId);

        return AuthResponse.builder()
                .token(token)
                .googleId(googleId)
                .email(email)
                .name(name)
                .picture(picture)
                .driveFolderId(user.getDriveFolderId())
                .build();
    }
}