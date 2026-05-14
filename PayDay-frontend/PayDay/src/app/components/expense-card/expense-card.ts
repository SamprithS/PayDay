import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense, CATEGORY_META } from '../../models/budget.model';

@Component({
  selector: 'app-expense-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button (click)="click.emit()"
            class="flex w-full items-center justify-between gap-3 rounded-2xl bg-card p-4 text-left shadow-soft transition hover:shadow-card">
      <div class="flex min-w-0 items-center gap-3">
        <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
             [style.background-color]="meta.color">
          {{ expense.name.charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <p class="truncate text-sm font-medium">{{ expense.name }}</p>
            <svg *ngIf="expense.hasBill" class="h-3.5 w-3.5 shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Bill attached">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
            <svg *ngIf="expense.recurring" class="h-3.5 w-3.5 shrink-0 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Recurring">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <svg *ngIf="expense.note" class="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-label="Has note">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17H9m6-4H9m12-1a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <p class="text-xs text-muted-foreground">
            {{ meta.label }}<span *ngIf="expense.recurring"> · {{ expense.recurring }}</span>
          </p>
        </div>
      </div>
      <div class="text-right">
        <p class="text-sm font-semibold">{{ fmt(expense.amount) }}</p>
      </div>
    </button>
  `
})
export class ExpenseCardComponent {
  @Input() expense!: Expense;
  @Output() click = new EventEmitter<void>();
  get meta() { return CATEGORY_META[this.expense.category]; }
  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}