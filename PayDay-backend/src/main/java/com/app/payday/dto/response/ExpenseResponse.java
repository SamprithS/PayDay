package com.app.payday.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class ExpenseResponse {
    private Long id;
    private String name;
    private BigDecimal amount;
    private String category;
    private LocalDate date;
    private Boolean hasBill;
    private String driveFileId;
    private LocalDateTime createdAt;
}