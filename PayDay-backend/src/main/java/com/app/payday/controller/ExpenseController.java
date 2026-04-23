package com.app.payday.controller;

import com.app.payday.dto.request.ExpenseRequest;
import com.app.payday.dto.response.ApiResponse;
import com.app.payday.dto.response.ExpenseResponse;
import com.app.payday.entity.User;
import com.app.payday.service.ExpenseService;
import com.app.payday.service.GoogleDriveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;
    private final GoogleDriveService driveService;

    // GET /api/expenses?year=2026&month=3
    @GetMapping
    public ResponseEntity<ApiResponse<List<ExpenseResponse>>> getExpenses(
            @AuthenticationPrincipal User user,
            @RequestParam int year,
            @RequestParam int month) {

        List<ExpenseResponse> expenses = expenseService.getExpenses(user, year, month);
        return ResponseEntity.ok(ApiResponse.ok(expenses));
    }

    // POST /api/expenses
    @PostMapping
    public ResponseEntity<ApiResponse<ExpenseResponse>> addExpense(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ExpenseRequest request) {

        ExpenseResponse response = expenseService.addExpense(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Expense added", response));
    }

    // DELETE /api/expenses/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteExpense(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {

        expenseService.deleteExpense(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Expense deleted", null));
    }

    // POST /api/expenses/upload-bill — uploads a bill to Google Drive
    @PostMapping("/upload-bill")
    public ResponseEntity<ApiResponse<String>> uploadBill(
            @AuthenticationPrincipal User user,
            @RequestParam("file") MultipartFile file,
            @RequestHeader("X-Google-Access-Token") String googleAccessToken) {

        if (user.getDriveFolderId() == null) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Drive folder not set up. Please sign out and sign in again."));
        }

        String driveFileId = driveService.uploadBill(
                googleAccessToken, user.getDriveFolderId(),
                file.getOriginalFilename(), file);

        return ResponseEntity.ok(ApiResponse.ok("Bill uploaded", driveFileId));
    }
}