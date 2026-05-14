import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SavingsGoal } from '../../models/budget.model';

@Component({
  selector: 'app-savings-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <h2 class="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/>
          </svg>
          Savings goals
        </h2>
        <button (click)="openNew()"
                class="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-soft hover:bg-secondary transition">
          <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          New
        </button>
      </div>

      <div *ngIf="goals.length === 0" class="rounded-2xl bg-card p-5 text-center text-sm text-muted-foreground shadow-soft">
        No goals yet. Set one to stay motivated 🎯
      </div>

      <div *ngIf="goals.length > 0" class="space-y-2">
        <button *ngFor="let g of goals" (click)="openEdit(g)"
                class="w-full rounded-2xl bg-card p-4 text-left shadow-soft transition hover:shadow-card">
          <div class="mb-2 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xl">{{ g.emoji ?? '🎯' }}</span>
              <div>
                <p class="text-sm font-medium">{{ g.name }}</p>
                <p class="text-xs text-muted-foreground">{{ fmt(g.saved) }} of {{ fmt(g.target) }}</p>
              </div>
            </div>
            <span class="text-sm font-semibold text-primary">{{ pct(g) }}%</span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div class="h-full rounded-full bg-gradient-brand" style="transition: width 700ms ease"
                 [style.width.%]="pct(g)"></div>
          </div>
          <p class="mt-2 text-xs text-muted-foreground">{{ fmt(Math.max(g.target - g.saved, 0)) }} to go</p>
        </button>
      </div>

      <!-- Dialog -->
      <div *ngIf="open()"
           class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
           style="background:rgba(0,0,0,0.6)" (click)="open.set(false)">
        <div class="w-full max-w-sm rounded-3xl bg-card border border-border shadow-card p-6 space-y-3"
             (click)="$event.stopPropagation()">
          <h2 class="text-lg font-semibold">{{ editing ? 'Edit goal' : 'New savings goal' }}</h2>

          <div class="flex gap-2">
            <div class="space-y-2">
              <label class="text-sm font-medium">Icon</label>
              <input [(ngModel)]="emoji" maxlength="2"
                     class="w-16 rounded-xl bg-secondary border border-border px-3 py-2 text-center text-xl text-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
            </div>
            <div class="flex-1 space-y-2">
              <label class="text-sm font-medium">Name</label>
              <input [(ngModel)]="name" placeholder="e.g. Japan Trip"
                     class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-2">
              <label class="text-sm font-medium">Target</label>
              <input type="number" [(ngModel)]="target"
                     class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
            </div>
            <div class="space-y-2">
              <label class="text-sm font-medium">Saved so far</label>
              <input type="number" [(ngModel)]="saved"
                     class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
            </div>
          </div>

          <div class="flex gap-2">
            <button *ngIf="editing"
                    (click)="deleteGoal()"
                    class="rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-red-400 hover:bg-secondary transition">
              Delete
            </button>
            <button (click)="submit()"
                    class="flex-1 rounded-xl bg-gradient-brand text-white font-medium py-2.5 hover:opacity-95 transition">
              {{ editing ? 'Save changes' : 'Add goal' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SavingsGoalsComponent {
  @Input() goals: SavingsGoal[] = [];
  @Output() upsert = new EventEmitter<SavingsGoal>();
  @Output() delete = new EventEmitter<string>();

  open = signal(false);
  editing: SavingsGoal | null = null;
  name = ''; target = ''; saved = ''; emoji = '🎯';
  Math = Math;

  openNew(): void { this.editing = null; this.name = ''; this.target = ''; this.saved = ''; this.emoji = '🎯'; this.open.set(true); }
  openEdit(g: SavingsGoal): void { this.editing = g; this.name = g.name; this.target = String(g.target); this.saved = String(g.saved); this.emoji = g.emoji ?? '🎯'; this.open.set(true); }

  submit(): void {
    const t = parseFloat(this.target);
    const s = parseFloat(this.saved) || 0;
    if (!this.name.trim() || !t || t <= 0) { alert('Enter a goal name and target'); return; }
    this.upsert.emit({ id: this.editing?.id ?? crypto.randomUUID(), name: this.name.trim(), target: t, saved: s, emoji: this.emoji });
    this.open.set(false);
  }

  deleteGoal(): void { if (this.editing) { this.delete.emit(this.editing.id); this.open.set(false); } }
  pct(g: SavingsGoal): number { return Math.round(Math.min((g.saved / g.target) * 100, 100)); }
  fmt(val: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  }
}