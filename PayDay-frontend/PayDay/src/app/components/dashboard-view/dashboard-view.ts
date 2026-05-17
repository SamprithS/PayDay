import { Component, Input, Output, EventEmitter, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TripleRingComponent, RingDatum } from '../triple-ring/triple-ring';
import { CategoryRowComponent } from '../category-row/category-row';
import { InsightsGridComponent } from '../insights-grid/insights-grid';
import { WeeklyTrendComponent } from '../weekly-trend/weekly-trend';
import { SubscriptionsPanelComponent } from '../subscriptions-panel/subscriptions-panel';
import { SavingsGoalsComponent } from '../savings-goals/savings-goals';
import { MonthBudget, Expense, Category, SavingsGoal } from '../../models/budget.model';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  imports: [CommonModule, FormsModule, TripleRingComponent, CategoryRowComponent,
            InsightsGridComponent, WeeklyTrendComponent, SubscriptionsPanelComponent, SavingsGoalsComponent],
  template: `
    <div class="flex flex-col gap-5 p-5 pb-24">

      <!-- Income + Edit -->
      <div class="flex items-end justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly income</p>
          <p class="text-2xl font-semibold tracking-tight">{{ fmt(budget.income) }}</p>
        </div>
        <button (click)="editOpen.set(true)"
                class="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-soft hover:bg-secondary transition">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
          Edit budget
        </button>
      </div>

      <!-- Ring -->
      <div class="flex justify-center rounded-3xl bg-gradient-surface p-6 shadow-card">
        <app-triple-ring [data]="ringData" [size]="260"></app-triple-ring>
      </div>

      <!-- Category rows -->
      <div class="space-y-2">
        <app-category-row *ngFor="let r of ringData"
          [category]="r.category" [spent]="r.spent" [budget]="r.budget"
          [daysElapsed]="isCurrentMonth ? daysElapsed : undefined"
          [daysInMonth]="isCurrentMonth ? daysInMonth : undefined">
        </app-category-row>
      </div>

      <!-- Insights -->
      <div>
        <h2 class="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Insights</h2>
        <app-insights-grid [income]="budget.income" [totalSpent]="totalSpent"
          [daysElapsed]="daysElapsed" [daysInMonth]="daysInMonth"
          [expenses]="expenses" [budgets]="allocations">
        </app-insights-grid>
      </div>

      <app-weekly-trend [expenses]="expenses"></app-weekly-trend>
      <app-subscriptions-panel [expenses]="expenses" [income]="budget.income"></app-subscriptions-panel>
      <app-savings-goals [goals]="goals"
        (upsert)="upsertGoal.emit($event)"
        (delete)="deleteGoal.emit($event)">
      </app-savings-goals>

      <p class="text-center text-xs text-muted-foreground">Swipe left for daily spends →</p>
    </div>

    <!-- Edit budget dialog -->
    <div *ngIf="editOpen()"
         class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
         style="background:rgba(0,0,0,0.6)" (click)="editOpen.set(false)">
      <div class="w-full max-w-sm rounded-3xl bg-card border border-border shadow-card p-6 space-y-3"
           (click)="$event.stopPropagation()">
        <h2 class="text-lg font-semibold">Set this month's plan</h2>
        <div class="space-y-2">
          <label class="text-sm font-medium">Income</label>
          <input type="number" [(ngModel)]="editIncome"
                 class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div class="space-y-2">
            <label class="text-xs font-medium">Needs</label>
            <input type="number" [(ngModel)]="editNeeds"
                   class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium">Wants</label>
            <input type="number" [(ngModel)]="editWants"
                   class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          </div>
          <div class="space-y-2">
            <label class="text-xs font-medium">Savings</label>
            <input type="number" [(ngModel)]="editSavings"
                   class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          </div>
        </div>
        <button (click)="saveBudget()"
                class="w-full rounded-xl bg-gradient-brand text-white font-medium py-2.5 hover:opacity-95 transition">
          Save
        </button>
      </div>
    </div>
  `
})
export class DashboardViewComponent implements OnChanges {
  @Input() date: Date = new Date();
  @Input() budget!: MonthBudget;
  @Input() expenses: Expense[] = [];
  @Input() goals: SavingsGoal[] = [];
  @Output() updateBudget = new EventEmitter<{ income: number; needsBudget: number; wantsBudget: number; savingsBudget: number }>();
  @Output() upsertGoal = new EventEmitter<SavingsGoal>();
  @Output() deleteGoal = new EventEmitter<string>();

  editOpen = signal(false);
  editIncome = 0; editNeeds = 0; editWants = 0; editSavings = 0;
  ringData: RingDatum[] = [];
  totalSpent = 0; daysElapsed = 0; daysInMonth = 30;
  isCurrentMonth = false;
  allocations: Record<Category, number> = { needs: 0, wants: 0, savings: 0 };
  categories: Category[] = ['needs', 'wants', 'savings'];

  ngOnChanges(): void {
    if (!this.budget) return;
    this.allocations = { needs: this.budget.needsBudget, wants: this.budget.wantsBudget, savings: this.budget.savingsBudget };
    const spentBy = (cat: Category) => this.expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0);
    this.ringData = this.categories.map(cat => ({ category: cat, spent: spentBy(cat), budget: this.allocations[cat] }));
    this.totalSpent = this.ringData.reduce((s, r) => s + r.spent, 0);
    const now = new Date();
    this.isCurrentMonth = now.getMonth() === this.date.getMonth() && now.getFullYear() === this.date.getFullYear();
    this.daysInMonth = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0).getDate();
    this.daysElapsed = this.isCurrentMonth ? now.getDate() : this.daysInMonth;
    this.editIncome = this.budget.income; this.editNeeds = this.budget.needsBudget;
    this.editWants = this.budget.wantsBudget; this.editSavings = this.budget.savingsBudget;
  }

  saveBudget(): void {
    this.updateBudget.emit({ income: +this.editIncome || 0, needsBudget: +this.editNeeds || 0, wantsBudget: +this.editWants || 0, savingsBudget: +this.editSavings || 0 });
    this.editOpen.set(false);
  }
  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}