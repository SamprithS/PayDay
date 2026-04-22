package com.app.payday.dto.request;

import com.app.payday.entity.Expense.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ExpenseRequest {

    @NotBlank
    private String name;

    @NotNull @Positive
    private BigDecimal amount;

    @NotNull
    private Category category;

    @NotNull
    private LocalDate date;

    private Boolean hasBill = false;
    private String driveFileId;
}