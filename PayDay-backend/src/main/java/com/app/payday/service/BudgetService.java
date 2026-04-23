package com.app.payday.service;

import com.app.payday.dto.request.MonthBudgetRequest;
import com.app.payday.dto.response.MonthBudgetResponse;
import com.app.payday.entity.MonthBudget;
import com.app.payday.entity.User;
import com.app.payday.repository.MonthBudgetRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class BudgetService {

    private final MonthBudgetRepository budgetRepository;

    public MonthBudgetResponse getOrCreateBudget(User user, int year, int month) {
        MonthBudget budget = budgetRepository
                .findByUserAndYearAndMonth(user, year, month)
                .orElseGet(() -> MonthBudget.builder()
                        .user(user)
                        .year(year)
                        .month(month)
                        .income(BigDecimal.ZERO)
                        .needsBudget(BigDecimal.ZERO)
                        .wantsBudget(BigDecimal.ZERO)
                        .savingsBudget(BigDecimal.ZERO)
                        .build());
        // Save it so future calls find it
        budget = budgetRepository.save(budget);
        return toResponse(budget);
    }

    public MonthBudgetResponse updateBudget(User user, int year, int month,
                                            MonthBudgetRequest req) {
        MonthBudget budget = budgetRepository
                .findByUserAndYearAndMonth(user, year, month)
                .orElseGet(() -> MonthBudget.builder()
                        .user(user).year(year).month(month).build());

        budget.setIncome(req.getIncome());
        budget.setNeedsBudget(req.getNeedsBudget());
        budget.setWantsBudget(req.getWantsBudget());
        budget.setSavingsBudget(req.getSavingsBudget());

        budget = budgetRepository.save(budget);
        log.info("Updated budget for user {} month {}/{}", user.getEmail(), year, month);
        return toResponse(budget);
    }

    private MonthBudgetResponse toResponse(MonthBudget b) {
        return MonthBudgetResponse.builder()
                .id(b.getId())
                .year(b.getYear())
                .month(b.getMonth())
                .income(b.getIncome())
                .needsBudget(b.getNeedsBudget())
                .wantsBudget(b.getWantsBudget())
                .savingsBudget(b.getSavingsBudget())
                .build();
    }
}