package com.app.payday.controller;

import com.app.payday.dto.request.MonthBudgetRequest;
import com.app.payday.dto.response.ApiResponse;
import com.app.payday.dto.response.MonthBudgetResponse;
import com.app.payday.entity.User;
import com.app.payday.service.BudgetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    // GET /api/budget?year=2026&month=3
    @GetMapping
    public ResponseEntity<ApiResponse<MonthBudgetResponse>> getBudget(
            @AuthenticationPrincipal User user,
            @RequestParam int year,
            @RequestParam int month) {

        MonthBudgetResponse response = budgetService.getOrCreateBudget(user, year, month);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    // PUT /api/budget?year=2026&month=3
    @PutMapping
    public ResponseEntity<ApiResponse<MonthBudgetResponse>> updateBudget(
            @AuthenticationPrincipal User user,
            @RequestParam int year,
            @RequestParam int month,
            @Valid @RequestBody MonthBudgetRequest request) {

        MonthBudgetResponse response = budgetService.updateBudget(user, year, month, request);
        return ResponseEntity.ok(ApiResponse.ok("Budget updated", response));
    }
}