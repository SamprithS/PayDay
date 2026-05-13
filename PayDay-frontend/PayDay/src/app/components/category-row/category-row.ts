import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category, CATEGORY_META } from '../../models/budget.model';

@Component({
  selector: 'app-category-row',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-2 rounded-2xl bg-card p-4 shadow-soft">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span aria-hidden class="h-2.5 w-2.5 rounded-full" [style.background-color]="meta.color"></span>
          <span class="text-sm font-medium">{{ meta.label }}</span>
          <span *ngIf="pace"
                [class]="pace === 'over'
                  ? 'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-red-500/15 text-red-400'
                  : 'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/15 text-primary'">
            {{ pace === 'on' ? 'On pace' : pace === 'under' ? 'Under pace' : 'Over pace' }}
          </span>
        </div>
        <span class="text-xs text-muted-foreground">{{ fmt(spent) }} / {{ fmt(budget) }}</span>
      </div>
      <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div class="h-full rounded-full" style="transition: width 700ms ease"
             [style.width.%]="pct" [style.background-color]="meta.color"></div>
      </div>
      <div class="text-xs text-muted-foreground">{{ fmt(remaining) }} left</div>
    </div>
  `
})
export class CategoryRowComponent {
  @Input() category!: Category;
  @Input() spent: number = 0;
  @Input() budget: number = 0;
  @Input() daysElapsed?: number;
  @Input() daysInMonth?: number;

  get meta() { return CATEGORY_META[this.category]; }
  get pct() { return this.budget === 0 ? 0 : Math.min((this.spent / this.budget) * 100, 100); }
  get remaining() { return Math.max(this.budget - this.spent, 0); }
  get pace(): 'on' | 'under' | 'over' | null {
    if (!this.daysElapsed || !this.daysInMonth || this.budget === 0 || this.category === 'savings') return null;
    const expected = (this.budget * this.daysElapsed) / this.daysInMonth;
    if (this.spent > expected * 1.1) return 'over';
    if (this.spent < expected * 0.85) return 'under';
    return 'on';
  }
  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}