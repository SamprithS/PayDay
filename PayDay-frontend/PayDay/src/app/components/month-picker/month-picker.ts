import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const START_YEAR = 2026;

@Component({
  selector: 'app-month-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button (click)="toggleOpen()"
              class="inline-flex items-center gap-2 rounded-2xl bg-card px-4 py-2 text-sm font-medium shadow-soft transition hover:bg-secondary border border-border/60">
        <span>{{ MONTHS[value.getMonth()] }} {{ value.getFullYear() }}</span>
        <svg class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      <div *ngIf="open()"
           class="absolute top-12 left-1/2 -translate-x-1/2 z-50 w-72 rounded-2xl bg-card border border-border shadow-card p-3">
        <div class="mb-3 flex items-center justify-between">
          <button (click)="prevYear()" [disabled]="viewYear() <= START_YEAR"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-secondary disabled:opacity-30">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <span class="text-base font-semibold tracking-tight">{{ viewYear() }}</span>
          <button (click)="nextYear()"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-secondary">
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-1.5">
          <button *ngFor="let m of MONTHS; let mi = index"
                  (click)="selectMonth(mi)"
                  [class]="isActive(mi)
                    ? 'rounded-xl px-2 py-2.5 text-sm font-medium bg-gradient-brand text-white shadow-soft'
                    : 'rounded-xl px-2 py-2.5 text-sm font-medium hover:bg-secondary text-foreground transition'">
            {{ m }}
          </button>
        </div>
      </div>

      <div *ngIf="open()" class="fixed inset-0 z-40" (click)="close()"></div>
    </div>
  `
})
export class MonthPickerComponent {
  @Input() value: Date = new Date();
  @Output() valueChange = new EventEmitter<Date>();

  MONTHS = MONTHS;
  START_YEAR = START_YEAR;
  open = signal(false);
  viewYear = signal(new Date().getFullYear());

  toggleOpen(): void {
    if (!this.open()) this.viewYear.set(this.value.getFullYear());
    this.open.update(v => !v);
  }
  close(): void { this.open.set(false); }
  prevYear(): void { if (this.viewYear() > START_YEAR) this.viewYear.update(y => y - 1); }
  nextYear(): void { this.viewYear.update(y => y + 1); }
  selectMonth(mi: number): void { this.valueChange.emit(new Date(this.viewYear(), mi, 1)); this.close(); }
  isActive(mi: number): boolean { return this.viewYear() === this.value.getFullYear() && mi === this.value.getMonth(); }
}