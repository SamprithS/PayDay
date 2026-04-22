package com.app.payday.repository;

import com.app.payday.entity.MonthBudget;
import com.app.payday.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MonthBudgetRepository extends JpaRepository<MonthBudget, Long> {
    Optional<MonthBudget> findByUserAndYearAndMonth(User user, Integer year, Integer month);
}