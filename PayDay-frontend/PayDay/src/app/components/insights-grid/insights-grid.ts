import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, Expense, CATEGORY_META } from '../../models/budget.model';

interface Stat { icon: string; label: string; value: string; hint?: string; tone?: string; }

@Component({
  selector: 'app-insights-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-2 gap-3">
      <div *ngFor="let s of stats" class="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-soft">
        <div class="flex items-center gap-2 text-muted-foreground">
          <span class="text-xs font-medium uppercase tracking-wider">{{ s.label }}</span>
        </div>
        <div class="text-lg font-semibold tracking-tight"
             [class.text-primary]="s.tone === 'good'"
             [class.text-red-400]="s.tone === 'bad'"
             [class.text-yellow-400]="s.tone === 'warn'">
          {{ s.value }}
        </div>
        <div *ngIf="s.hint" class="text-xs text-muted-foreground">{{ s.hint }}</div>
      </div>
    </div>
  `
})
export class InsightsGridComponent implements OnChanges {
  @Input() income: number = 0;
  @Input() totalSpent: number = 0;
  @Input() daysElapsed: number = 0;
  @Input() daysInMonth: number = 30;
  @Input() expenses: Expense[] = [];
  @Input() budgets: Record<Category, number> = { needs: 0, wants: 0, savings: 0 };

  stats: Stat[] = [];

  ngOnChanges(): void {
    const dailyAvg = this.daysElapsed > 0 ? this.totalSpent / this.daysElapsed : 0;
    const projected = Math.round(dailyAvg * this.daysInMonth);
    const daysLeft = Math.max(this.daysInMonth - this.daysElapsed, 0);
    const spendable = (this.budgets.needs ?? 0) + (this.budgets.wants ?? 0);
    const spentOnSpendable = this.expenses.filter(e => e.category !== 'savings').reduce((s, e) => s + e.amount, 0);
    const remainingSpendable = Math.max(spendable - spentOnSpendable, 0);
    const safeDaily = daysLeft > 0 ? remainingSpendable / daysLeft : remainingSpendable;

    const byCat: Record<Category, number> = { needs: 0, wants: 0, savings: 0 };
    this.expenses.forEach(e => { byCat[e.category] += e.amount; });
    const topCat = (Object.entries(byCat) as [Category, number][]).sort((a, b) => b[1] - a[1])[0];
    const biggest = this.expenses.reduce<Expense | null>((max, e) => (!max || e.amount > max.amount ? e : max), null);

    const projectedTone = projected > this.income ? 'bad' : projected > this.income * 0.9 ? 'warn' : 'good';
    const safeTone = safeDaily < dailyAvg * 0.7 ? 'bad' : safeDaily < dailyAvg ? 'warn' : 'good';

    this.stats = [
      { icon: 'wallet', label: 'Safe to spend / day', value: this.fmt(Math.round(safeDaily)), hint: `for next ${daysLeft} day${daysLeft === 1 ? '' : 's'}`, tone: safeTone },
      { icon: 'up', label: 'Projected', value: this.fmt(projected), hint: 'by month end', tone: projectedTone },
      { icon: 'calendar', label: 'Daily avg', value: this.fmt(Math.round(dailyAvg)), hint: `over ${this.daysElapsed} days` },
      { icon: 'down', label: 'Spent', value: this.fmt(this.totalSpent), hint: `of ${this.fmt(this.income)} income` },
      { icon: 'award', label: 'Top category', value: topCat && topCat[1] > 0 ? CATEGORY_META[topCat[0]].label : '—', hint: topCat && topCat[1] > 0 ? this.fmt(topCat[1]) : 'no spends yet' },
      { icon: 'piggy', label: 'Biggest spend', value: biggest ? this.fmt(biggest.amount) : '—', hint: biggest?.name ?? 'no spends yet' },
    ];
  }

  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}