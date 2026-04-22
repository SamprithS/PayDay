package com.app.payday.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class MonthBudgetResponse {
    private Long id;
    private Integer year;
    private Integer month;
    private BigDecimal income;
    private BigDecimal needsBudget;
    private BigDecimal wantsBudget;
    private BigDecimal savingsBudget;
}