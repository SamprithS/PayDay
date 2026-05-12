import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-wallet-logo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="inline-flex items-center justify-center rounded-2xl bg-gradient-brand shadow-glow"
         [style.width.px]="size" [style.height.px]="size">
      <img src="wallet-logo.png" alt="PayDay"
           [style.width.px]="size * 0.62" [style.height.px]="size * 0.62"
           style="filter: brightness(0) invert(1);" />
    </div>
  `
})
export class WalletLogoComponent {
  @Input() size: number = 64;
}