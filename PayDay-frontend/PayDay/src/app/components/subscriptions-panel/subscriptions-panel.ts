import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense, CATEGORY_META } from '../../models/budget.model';

interface Sub { name: string; amount: number; cadence: 'monthly' | 'weekly'; color: string; }

@Component({
  selector: 'app-subscriptions-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3 rounded-2xl bg-card p-4 shadow-soft">
      <div class="flex items-center gap-2 text-muted-foreground">
        <span class="text-xs font-medium uppercase tracking-wider">Recurring · {{ subs.length }}</span>
      </div>
      <div *ngIf="subs.length === 0">
        <p class="text-sm text-muted-foreground">No recurring expenses yet. Mark any expense as recurring to track subscriptions here.</p>
      </div>
      <ng-container *ngIf="subs.length > 0">
        <div class="flex items-end justify-between">
          <p class="mt-1 text-lg font-semibold tracking-tight">
            {{ fmt(Math.round(monthlyTotal)) }}
            <span class="text-xs font-normal text-muted-foreground">/ month</span>
          </p>
          <span *ngIf="income > 0"
                class="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
            {{ incomePct }}% of income
          </span>
        </div>
        <div class="space-y-1.5">
          <div *ngFor="let s of subs" class="flex items-center justify-between rounded-xl bg-secondary/40 px-3 py-2">
            <div class="flex items-center gap-2 min-w-0">
              <span aria-hidden class="h-2 w-2 shrink-0 rounded-full" [style.background-color]="s.color"></span>
              <span class="truncate text-sm">{{ s.name }}</span>
              <span class="shrink-0 text-[10px] uppercase text-muted-foreground">{{ s.cadence }}</span>
            </div>
            <span class="text-sm font-medium">{{ fmt(s.amount) }}</span>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class SubscriptionsPanelComponent implements OnChanges {
  @Input() expenses: Expense[] = [];
  @Input() income: number = 0;

  subs: Sub[] = [];
  monthlyTotal = 0;
  incomePct = 0;
  Math = Math;

  ngOnChanges(): void {
    const map = new Map<string, Sub>();
    this.expenses
      .filter(e => e.recurring === 'monthly' || e.recurring === 'weekly')
      .forEach(e => {
        const key = `${e.name.toLowerCase()}|${e.recurring}`;
        if (!map.has(key)) map.set(key, {
          name: e.name, amount: e.amount,
          cadence: e.recurring as 'monthly' | 'weekly',
          color: CATEGORY_META[e.category].color
        });
      });
    this.subs = Array.from(map.values());
    this.monthlyTotal = this.subs.reduce((s, x) => s + (x.cadence === 'weekly' ? x.amount * 4.33 : x.amount), 0);
    this.incomePct = this.income > 0 ? Math.round((this.monthlyTotal / this.income) * 100) : 0;
  }

  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}