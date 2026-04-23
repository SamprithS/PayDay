package com.app.payday.service;

import com.app.payday.dto.request.ExpenseRequest;
import com.app.payday.dto.response.ExpenseResponse;
import com.app.payday.entity.Expense;
import com.app.payday.entity.User;
import com.app.payday.repository.ExpenseRepository;
import com.app.payday.utility.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public List<ExpenseResponse> getExpenses(User user, int year, int month) {
        // month here is 0-indexed (JS convention)
        LocalDate start = LocalDate.of(year, month + 1, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        return expenseRepository
                .findByUserAndDateBetweenOrderByDateDesc(user, start, end)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ExpenseResponse addExpense(User user, ExpenseRequest req) {
        Expense expense = Expense.builder()
                .user(user)
                .name(req.getName())
                .amount(req.getAmount())
                .category(req.getCategory())
                .date(req.getDate())
                .hasBill(req.getHasBill() != null && req.getHasBill())
                .driveFileId(req.getDriveFileId())
                .build();

        expense = expenseRepository.save(expense);
        log.info("Added expense '{}' for user {}", expense.getName(), user.getEmail());
        return toResponse(expense);
    }

    public void deleteExpense(User user, Long expenseId) {
        Expense expense = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));

        if (!expense.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Expense not found");
        }

        expenseRepository.delete(expense);
        log.info("Deleted expense {} for user {}", expenseId, user.getEmail());
    }

    private ExpenseResponse toResponse(Expense e) {
        return ExpenseResponse.builder()
                .id(e.getId())
                .name(e.getName())
                .amount(e.getAmount())
                .category(e.getCategory().name())
                .date(e.getDate())
                .hasBill(e.getHasBill())
                .driveFileId(e.getDriveFileId())
                .createdAt(e.getCreatedAt())
                .build();
    }
}