import { Component, Input, Output, EventEmitter, signal, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Expense, Category, CATEGORY_META } from '../../models/budget.model';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-add-expense-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <button *ngIf="!controlledOpen"
              (click)="open.set(true)"
              class="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-brand text-white text-base font-medium shadow-glow hover:opacity-95 px-6 py-3 transition">
        <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
        </svg>
        Add expense
      </button>

      <div *ngIf="isOpen()"
           class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
           style="background:rgba(0,0,0,0.6)" (click)="closeDialog()">
        <div class="w-full max-w-sm rounded-3xl bg-card border border-border shadow-card p-6 space-y-4 max-h-[90vh] overflow-y-auto"
             (click)="$event.stopPropagation()">
          <h2 class="text-lg font-semibold flex items-center gap-2">
            <svg *ngIf="isEdit" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
            {{ isEdit ? 'Edit expense' : 'New expense' }}
          </h2>

          <!-- Name -->
          <div class="space-y-2">
            <label class="text-sm font-medium">What was it?</label>
            <input type="text" placeholder="e.g. Groceries" [(ngModel)]="name"
                   class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          </div>

          <!-- Amount -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Amount</label>
            <input type="number" inputmode="decimal" placeholder="0" [(ngModel)]="amount"
                   class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"/>
          </div>

          <!-- Category -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Category</label>
            <div class="grid grid-cols-3 gap-2">
              <button *ngFor="let cat of categories" type="button" (click)="category = cat"
                      [style.background-color]="category === cat ? getMeta(cat).color : ''"
                      [class]="category === cat
                        ? 'rounded-xl border-2 border-transparent px-2 py-3 text-sm font-medium text-white shadow-soft'
                        : 'rounded-xl border-2 border-border bg-card px-2 py-3 text-sm font-medium hover:bg-secondary transition'">
                {{ getMeta(cat).label }}
              </button>
            </div>
          </div>

          <!-- Recurring -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Recurring</label>
            <div class="grid grid-cols-3 gap-2">
              <button *ngFor="let r of recurringOptions" type="button" (click)="recurring = r"
                      [class]="recurring === r
                        ? 'rounded-xl border-2 border-primary bg-primary/10 text-primary px-2 py-2 text-xs font-medium capitalize'
                        : 'rounded-xl border-2 border-border bg-card text-muted-foreground px-2 py-2 text-xs font-medium capitalize hover:bg-secondary transition'">
                {{ r === 'none' ? 'One-time' : r }}
              </button>
            </div>
          </div>

          <!-- Note -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Note (optional)</label>
            <textarea [(ngModel)]="note" placeholder="Why did you spend this?" rows="2"
                      class="w-full rounded-xl bg-secondary border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"></textarea>
          </div>

          <!-- Bill -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Bill (optional)</label>
            <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/50 p-3 text-sm transition hover:bg-secondary">
              <svg *ngIf="!billFile" class="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
              </svg>
              <svg *ngIf="billFile" class="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <span [class]="billFile ? 'text-foreground' : 'text-muted-foreground'">
                {{ billFile ? billFile.name : 'Upload bill — saved to your Drive › bills_payday' }}
              </span>
              <input type="file" accept="image/*,.pdf" class="sr-only" (change)="onFileSelect($event)"/>
            </label>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button *ngIf="isEdit" (click)="handleDelete()"
                    class="rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-red-400 hover:bg-secondary transition">
              Delete
            </button>
            <button (click)="submit()"
                    class="flex-1 rounded-xl bg-gradient-brand text-white font-medium py-2.5 hover:opacity-95 transition">
              {{ isEdit ? 'Save changes' : 'Save expense' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AddExpenseDialogComponent implements OnChanges {
  @Input() date: Date = new Date();
  @Input() expense?: Expense;
  @Input() controlledOpen?: boolean;
  @Output() openChange = new EventEmitter<boolean>();
  @Output() expenseAdded = new EventEmitter<Expense>();
  @Output() expenseUpdated = new EventEmitter<{ id: string; patch: Partial<Expense> }>();
  @Output() expenseDeleted = new EventEmitter<string>();

  open = signal(false);
  name = ''; amount = ''; note = '';
  category: Category = 'needs';
  recurring: 'none' | 'monthly' | 'weekly' = 'none';
  billFile: File | null = null;
  categories: Category[] = ['needs', 'wants', 'savings'];
  recurringOptions = ['none', 'weekly', 'monthly'] as const;

  get isEdit(): boolean { return !!this.expense; }
  get isOpen(): ReturnType<typeof signal<boolean>> { return this.controlledOpen !== undefined ? signal(this.controlledOpen) : this.open; }

  constructor(private api: ApiService, private auth: AuthService) {}

  ngOnChanges(): void {
    if (this.expense) {
      this.name = this.expense.name;
      this.amount = String(this.expense.amount);
      this.category = this.expense.category;
      this.recurring = (this.expense.recurring as any) ?? 'none';
      this.note = this.expense.note ?? '';
    }
  }

  getMeta(cat: Category) { return CATEGORY_META[cat]; }
  onFileSelect(event: Event): void { const f = (event.target as HTMLInputElement).files?.[0]; if (f) this.billFile = f; }

  closeDialog(): void {
    if (this.controlledOpen !== undefined) this.openChange.emit(false);
    else { this.open.set(false); this.reset(); }
  }

  reset(): void { this.name = ''; this.amount = ''; this.category = 'needs'; this.recurring = 'none'; this.note = ''; this.billFile = null; }

  submit(): void {
    const amt = parseFloat(this.amount);
    if (!this.name.trim() || !amt || amt <= 0) { alert('Please enter a name and valid amount'); return; }

    const payload = {
      name: this.name.trim(), amount: amt, category: this.category,
      date: this.isEdit ? this.expense!.date : this.date.toISOString().split('T')[0],
      hasBill: false,
      recurring: this.recurring === 'none' ? null : this.recurring,
      note: this.note.trim() || undefined
    };

    if (this.isEdit) {
      this.expenseUpdated.emit({ id: this.expense!.id, patch: payload });
      this.closeDialog();
      return;
    }

    const doAdd = (driveFileId?: string) => {
      this.api.addExpense({ ...payload, hasBill: !!driveFileId, driveFileId }).subscribe({
        next: (saved) => { this.expenseAdded.emit(saved); this.closeDialog(); this.reset(); },
        error: (err) => alert('Could not save expense: ' + err.message)
      });
    };

    if (this.billFile) {
      const token = this.auth.getGoogleAccessToken();
      if (!token) { doAdd(); return; }
      this.api.uploadBill(this.billFile, token).subscribe({ next: (id) => doAdd(id), error: () => doAdd() });
    } else { doAdd(); }
  }

  handleDelete(): void { if (this.expense) { this.expenseDeleted.emit(this.expense.id); this.closeDialog(); } }
}