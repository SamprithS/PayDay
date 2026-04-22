package com.app.payday.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class MonthBudgetRequest {

    @NotNull @Min(0)
    private BigDecimal income;

    @NotNull @Min(0)
    private BigDecimal needsBudget;

    @NotNull @Min(0)
    private BigDecimal wantsBudget;

    @NotNull @Min(0)
    private BigDecimal savingsBudget;
}