import { Component, Input, Output, EventEmitter, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExpenseCardComponent } from '../expense-card/expense-card';
import { AddExpenseDialogComponent } from '../add-expense-dialog/add-expense-dialog';
import { Expense, Category, CATEGORY_META } from '../../models/budget.model';

interface DayGroup { dayKey: string; dayLabel: string; dayTotal: number; items: Expense[]; }

@Component({
  selector: 'app-daily-spends-view',
  standalone: true,
  imports: [CommonModule, FormsModule, ExpenseCardComponent, AddExpenseDialogComponent],
  template: `
    <div class="flex flex-col gap-4 p-5 pb-24">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Daily spends</p>
          <h2 class="text-2xl font-semibold tracking-tight">Your timeline</h2>
        </div>
        <div class="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs text-secondary-foreground">
          <svg class="h-3.5 w-3.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
          {{ billsCount }} bill{{ billsCount === 1 ? '' : 's' }}
        </div>
      </div>

      <!-- Add expense button -->
      <app-add-expense-dialog [date]="today"
        (expenseAdded)="expenseAdded.emit($event)">
      </app-add-expense-dialog>

      <!-- Search -->
      <div class="space-y-2">
        <div class="relative">
          <svg class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input [(ngModel)]="query" placeholder="Search by name or note..."
                 class="w-full rounded-xl bg-secondary border border-border pl-9 pr-9 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          <button *ngIf="query" (click)="query = ''; filterExpenses()"
                  class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary">
            <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="flex gap-1.5">
          <button *ngFor="let f of filterOptions"
                  (click)="activeFilter = f; filterExpenses()"
                  [class]="activeFilter === f
                    ? 'flex-1 rounded-xl px-2 py-1.5 text-xs font-medium capitalize bg-gradient-brand text-white shadow-soft'
                    : 'flex-1 rounded-xl px-2 py-1.5 text-xs font-medium capitalize bg-secondary text-muted-foreground hover:text-foreground transition'">
            {{ f === 'all' ? 'All' : getCategoryLabel(f) }}
          </button>
        </div>
      </div>

      <!-- Empty state -->
      <div *ngIf="grouped.length === 0" class="rounded-2xl bg-card p-8 text-center shadow-soft">
        <p class="text-sm text-muted-foreground">
          {{ expenses.length === 0 ? 'No spends yet for this month.' : 'No matches.' }}
        </p>
      </div>

      <!-- Groups -->
      <div *ngFor="let group of grouped" class="space-y-2">
        <div class="flex items-center justify-between px-1">
          <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{{ group.dayLabel }}</span>
          <span class="text-xs font-medium text-foreground">{{ fmt(group.dayTotal) }}</span>
        </div>
        <div class="space-y-2">
          <app-expense-card *ngFor="let e of group.items" [expense]="e"
            (click)="editingExpense.set(e)">
          </app-expense-card>
        </div>
      </div>

      <!-- Edit dialog -->
      <app-add-expense-dialog
        *ngIf="editingExpense()"
        [expense]="editingExpense()!"
        [date]="today"
        [controlledOpen]="true"
        (openChange)="editingExpense.set(null)"
        (expenseUpdated)="onUpdate($event)"
        (expenseDeleted)="onDelete($event)">
      </app-add-expense-dialog>

      <p class="text-center text-xs text-muted-foreground">← Swipe right for dashboard</p>
    </div>
  `
})
export class DailySpendsViewComponent implements OnChanges {
  @Input() expenses: Expense[] = [];
  @Output() expenseAdded = new EventEmitter<Expense>();
  @Output() expenseUpdated = new EventEmitter<{ id: string; patch: Partial<Expense> }>();
  @Output() expenseDeleted = new EventEmitter<string>();

  today = new Date();
  grouped: DayGroup[] = [];
  billsCount = 0;
  query = '';
  activeFilter: 'all' | Category = 'all';
  filterOptions = ['all', 'needs', 'wants', 'savings'] as const;
  editingExpense = signal<Expense | null>(null);

  ngOnChanges(): void { this.filterExpenses(); this.billsCount = this.expenses.filter(e => e.hasBill).length; }

  filterExpenses(): void {
    const q = this.query.trim().toLowerCase();
    const filtered = this.expenses.filter(e => {
      if (this.activeFilter !== 'all' && e.category !== this.activeFilter) return false;
      if (q && !e.name.toLowerCase().includes(q) && !e.note?.toLowerCase().includes(q)) return false;
      return true;
    });
    this.grouped = this.groupByDay(filtered);
  }

  groupByDay(expenses: Expense[]): DayGroup[] {
    const map = new Map<string, Expense[]>();
    [...expenses].sort((a, b) => +new Date(b.date) - +new Date(a.date))
      .forEach(e => { const k = new Date(e.date).toDateString(); map.set(k, [...(map.get(k) ?? []), e]); });
    return Array.from(map.entries()).map(([dayKey, items]) => {
      const d = new Date(dayKey);
      const now = new Date();
      const isToday = d.toDateString() === now.toDateString();
      const yest = new Date(now); yest.setDate(yest.getDate() - 1);
      const isYesterday = d.toDateString() === yest.toDateString();
      return {
        dayKey, items,
        dayLabel: isToday ? 'Today' : isYesterday ? 'Yesterday' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
        dayTotal: items.reduce((s, e) => s + e.amount, 0)
      };
    });
  }

  getCategoryLabel(cat: string): string { return CATEGORY_META[cat as Category]?.label ?? cat; }

  onUpdate(e: { id: string; patch: Partial<Expense> }): void {
    this.expenseUpdated.emit(e);
    this.editingExpense.set(null);
  }
  onDelete(id: string): void {
    this.expenseDeleted.emit(id);
    this.editingExpense.set(null);
  }

  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}