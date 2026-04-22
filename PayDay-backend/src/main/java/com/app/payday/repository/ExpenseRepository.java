package com.app.payday.repository;

import com.app.payday.entity.Expense;
import com.app.payday.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserAndDateBetweenOrderByDateDesc(
            User user, LocalDate start, LocalDate end
    );
    void deleteByIdAndUser(Long id, User user);
}