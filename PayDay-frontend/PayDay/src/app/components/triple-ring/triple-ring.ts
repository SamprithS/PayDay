import { Component, Input, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { Category, CATEGORY_META } from '../../models/budget.model';

export interface RingDatum { category: Category; spent: number; budget: number; }

const STROKE = 14;
const GAP = 8;
const HOLD_MS = 450;

@Component({
  selector: 'app-triple-ring',
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('fadeScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.92)' }),
        animate('180ms ease', style({ opacity: 1, transform: 'scale(1)' }))
      ]),
      transition(':leave', [
        animate('180ms ease', style({ opacity: 0, transform: 'scale(0.92)' }))
      ])
    ])
  ],
  template: `
    <div class="relative select-none" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" class="-rotate-90 overflow-visible">
        <g *ngFor="let cat of orderedCategories; let i = index">
          <circle [attr.cx]="cx" [attr.cy]="cy" [attr.r]="radii[i]"
                  fill="none" stroke="hsl(var(--secondary))" [attr.stroke-width]="STROKE"/>
          <circle [attr.cx]="cx" [attr.cy]="cy" [attr.r]="radii[i]"
                  fill="none"
                  [attr.stroke]="getMeta(cat).color"
                  [attr.stroke-width]="STROKE"
                  stroke-linecap="round"
                  [attr.stroke-dasharray]="getCircumference(i)"
                  [attr.stroke-dashoffset]="getDashOffset(cat, i)"
                  [style.opacity]="activeCat() && activeCat() !== cat ? 0.35 : 1"
                  [style.filter]="activeCat() === cat ? 'drop-shadow(0 0 10px ' + getMeta(cat).color + ')' : 'none'"
                  style="transition: stroke-dashoffset 0.6s ease, opacity 0.3s, filter 0.3s"/>
          <circle [attr.cx]="cx" [attr.cy]="cy" [attr.r]="radii[i]"
                  fill="none" stroke="transparent" [attr.stroke-width]="STROKE + GAP"
                  style="cursor:pointer;pointer-events:stroke"
                  (pointerdown)="startHold($event, cat)"
                  (pointerup)="release()" (pointerleave)="release()"
                  (pointercancel)="release()" (contextmenu)="$event.preventDefault()"/>
        </g>
      </svg>
      <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <ng-container *ngIf="activeCat(); else totalTpl">
          <span class="text-xs font-semibold uppercase tracking-wider" [style.color]="getMeta(activeCat()!).color">
            {{ getMeta(activeCat()!).label }} left
          </span>
          <span class="mt-1 text-2xl font-semibold tracking-tight">{{ fmt(getActiveRemaining()) }}</span>
          <span class="mt-1 text-xs text-muted-foreground">of {{ fmt(getActiveBudget()) }}</span>
        </ng-container>
        <ng-template #totalTpl>
          <span class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Remaining</span>
          <span class="mt-1 text-2xl font-semibold tracking-tight">{{ fmt(remaining) }}</span>
          <span class="mt-1 text-xs text-muted-foreground">of {{ fmt(totalBudget) }}</span>
        </ng-template>
      </div>
    </div>
  `
})
export class TripleRingComponent implements OnChanges {
  @Input() data: RingDatum[] = [];
  @Input() size: number = 260;

  STROKE = STROKE;
  orderedCategories: Category[] = ['needs', 'wants', 'savings'];
  radii: number[] = [];
  cx = 0; cy = 0;
  totalBudget = 0; remaining = 0;
  activeCat = signal<Category | null>(null);
  private holdTimer: any;

  ngOnChanges(): void {
    this.cx = this.size / 2; this.cy = this.size / 2;
    this.radii = this.orderedCategories.map((_, i) => (this.size - STROKE) / 2 - i * (STROKE + GAP));
    this.totalBudget = this.data.reduce((s, d) => s + d.budget, 0);
    this.remaining = Math.max(this.totalBudget - this.data.reduce((s, d) => s + d.spent, 0), 0);
  }

  getMeta(cat: Category | null) { return CATEGORY_META[cat ?? 'needs']; }
  getCircumference(i: number): number { return 2 * Math.PI * this.radii[i]; }
  getDashOffset(cat: Category, i: number): number {
    const c = this.getCircumference(i);
    const d = this.data.find(x => x.category === cat);
    if (!d || d.budget === 0) return c;
    return c * (1 - Math.min(d.spent / d.budget, 1));
  }
  getActiveRemaining(): number {
    const cat = this.activeCat(); if (!cat) return 0;
    const d = this.data.find(x => x.category === cat);
    return d ? Math.max(d.budget - d.spent, 0) : 0;
  }
  getActiveBudget(): number {
    const cat = this.activeCat(); if (!cat) return 0;
    return this.data.find(x => x.category === cat)?.budget ?? 0;
  }
  startHold(event: Event, cat: Category): void {
    event.preventDefault(); clearTimeout(this.holdTimer);
    this.holdTimer = setTimeout(() => this.activeCat.set(cat), HOLD_MS);
  }
  release(): void { clearTimeout(this.holdTimer); this.activeCat.set(null); }
  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}