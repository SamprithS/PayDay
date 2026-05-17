import { Component, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DashboardViewComponent } from '../dashboard-view/dashboard-view';
import { DailySpendsViewComponent } from '../daily-spends-view/daily-spends-view';
import { MonthPickerComponent } from '../month-picker/month-picker';
import { WalletLogoComponent } from '../wallet-logo/wallet-logo';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { MonthBudget, Expense, SavingsGoal } from '../../models/budget.model';

@Component({
  selector: 'app-app-shell',
  standalone: true,
  imports: [CommonModule, DashboardViewComponent, DailySpendsViewComponent, MonthPickerComponent, WalletLogoComponent],
  animations: [
    trigger('pageAnim', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(30px)' }),
        animate('250ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':leave', [
        animate('250ms ease', style({ opacity: 0, transform: 'translateX(-30px)' }))
      ])
    ])
  ],
  template: `
    <div class="flex h-full flex-col bg-gradient-surface">
      <!-- Top bar -->
      <header class="flex items-center justify-between border-b border-border/60 bg-card/40 px-4 py-3 backdrop-blur">
        <div class="flex items-center gap-2">
          <app-wallet-logo [size]="32"></app-wallet-logo>
          <span class="text-sm font-semibold tracking-tight">PayDay</span>
        </div>
        <app-month-picker [value]="month" (valueChange)="onMonthChange($event)"></app-month-picker>
        <button (click)="signOut()" aria-label="Sign out"
                class="rounded-xl p-2 hover:bg-secondary transition">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </header>

      <!-- Tabs -->
      <div class="flex items-center justify-center gap-1 border-b border-border/60 bg-card/40 px-4 py-2">
        <button *ngFor="let tab of tabs; let i = index" (click)="page.set(i)"
                [class]="page() === i
                  ? 'rounded-xl px-4 py-1.5 text-sm font-medium bg-gradient-brand text-white shadow-soft'
                  : 'rounded-xl px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition'">
          {{ tab }}
        </button>
      </div>

      <!-- Content -->
      <div class="relative flex-1 overflow-hidden"
           (touchstart)="onTouchStart($event)" (touchend)="onTouchEnd($event)">
        <div *ngIf="loading" class="flex h-full items-center justify-center">
          <p class="text-muted-foreground text-sm">Loading...</p>
        </div>
        <ng-container *ngIf="!loading">
          <div *ngIf="page() === 0" class="no-scrollbar h-full w-full overflow-y-auto">
            <app-dashboard-view *ngIf="budget"
              [date]="month" [budget]="budget" [expenses]="expenses" [goals]="goals"
              (updateBudget)="onUpdateBudget($event)"
              (upsertGoal)="onUpsertGoal($event)"
              (deleteGoal)="onDeleteGoal($event)">
            </app-dashboard-view>
          </div>
          <div *ngIf="page() === 1" class="no-scrollbar h-full w-full overflow-y-auto">
            <app-daily-spends-view
              [expenses]="expenses"
              (expenseAdded)="onExpenseAdded($event)"
              (expenseUpdated)="onExpenseUpdated($event)"
              (expenseDeleted)="onExpenseDeleted($event)">
            </app-daily-spends-view>
          </div>
        </ng-container>
      </div>
    </div>
  `
})
export class AppShellComponent implements OnInit {
  @Output() signedOut = new EventEmitter<void>();

  tabs = ['Dashboard', 'Daily spends'];
  page = signal<number>(0);
  month: Date = new Date();
  budget: MonthBudget | null = null;
  expenses: Expense[] = [];
  goals: SavingsGoal[] = [];
  loading = false;
  private touchStartX = 0;

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnInit(): void { this.loadData(); }

  loadData(): void {
    this.loading = true;
    const year = this.month.getFullYear();
    const month = this.month.getMonth();
    this.api.getBudget(year, month).subscribe({
      next: b => { this.budget = b; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.api.getExpenses(year, month).subscribe({
      next: e => { this.expenses = e; },
      error: () => {}
    });
  }

  onMonthChange(date: Date): void { this.month = date; this.loadData(); }

  onUpdateBudget(alloc: any): void {
    this.api.updateBudget(this.month.getFullYear(), this.month.getMonth(), alloc).subscribe({
      next: b => { this.budget = b; },
      error: e => alert('Could not update budget: ' + e.message)
    });
  }

  onExpenseAdded(expense: Expense): void { this.expenses = [expense, ...this.expenses]; }

  onExpenseUpdated(e: { id: string; patch: Partial<Expense> }): void {
    this.expenses = this.expenses.map(x => x.id === e.id ? { ...x, ...e.patch } : x);
  }

  onExpenseDeleted(id: string): void {
    this.expenses = this.expenses.filter(x => x.id !== id);
  }

  onUpsertGoal(goal: SavingsGoal): void {
    const exists = this.goals.some(g => g.id === goal.id);
    this.goals = exists ? this.goals.map(g => g.id === goal.id ? goal : g) : [...this.goals, goal];
  }

  onDeleteGoal(id: string): void { this.goals = this.goals.filter(g => g.id !== id); }

  signOut(): void { this.auth.signOut(); this.signedOut.emit(); }

  onTouchStart(e: TouchEvent): void { this.touchStartX = e.touches[0].clientX; }
  onTouchEnd(e: TouchEvent): void {
    const diff = this.touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0 && this.page() === 0) this.page.set(1);
      else if (diff < 0 && this.page() === 1) this.page.set(0);
    }
  }
}