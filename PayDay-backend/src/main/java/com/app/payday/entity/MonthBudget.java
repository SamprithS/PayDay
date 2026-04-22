package com.app.payday.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "month_budgets",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "year", "month"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MonthBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer month; // 0-indexed like JS (Jan=0, Dec=11)

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal income;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal needsBudget;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal wantsBudget;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal savingsBudget;
}