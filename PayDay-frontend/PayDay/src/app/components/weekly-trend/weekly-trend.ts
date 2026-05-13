import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Expense } from '../../models/budget.model';

interface DayBar { label: string; total: number; iso: string; }

@Component({
  selector: 'app-weekly-trend',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rounded-2xl bg-card p-4 shadow-soft">
      <div class="mb-3 flex items-end justify-between">
        <div>
          <p class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Last 7 days</p>
          <p class="text-lg font-semibold tracking-tight">{{ fmt(weekTotal) }}</p>
        </div>
        <p class="text-xs text-muted-foreground">{{ fmt(Math.round(weekTotal / 7)) }} / day avg</p>
      </div>
      <div class="flex h-28 items-end justify-between gap-2">
        <div *ngFor="let d of days; let i = index" class="flex flex-1 flex-col items-center gap-1.5">
          <div class="relative flex w-full flex-1 items-end">
            <div class="w-full rounded-md bg-gradient-brand transition-all"
                 [style.height]="getHeight(d.total)"
                 [title]="fmt(d.total)">
            </div>
          </div>
          <span [class]="i === days.length - 1 ? 'text-[10px] font-bold text-primary' : 'text-[10px] text-muted-foreground'">
            {{ d.label }}
          </span>
        </div>
      </div>
    </div>
  `
})
export class WeeklyTrendComponent implements OnChanges {
  @Input() expenses: Expense[] = [];

  days: DayBar[] = [];
  weekTotal = 0;
  max = 1;
  Math = Math;

  ngOnChanges(): void {
    const now = new Date();
    this.days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const total = this.expenses
        .filter(e => { const t = +new Date(e.date); return t >= +d && t < +next; })
        .reduce((s, e) => s + e.amount, 0);
      this.days.push({ label: d.toLocaleDateString('en-US', { weekday: 'narrow' }), total, iso: d.toDateString() });
    }
    this.weekTotal = this.days.reduce((s, d) => s + d.total, 0);
    this.max = Math.max(...this.days.map(d => d.total), 1);
  }

  getHeight(total: number): string { return `${Math.max((total / this.max) * 100, 4)}%`; }
  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}