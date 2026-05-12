import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { WalletLogoComponent } from '../wallet-logo/wallet-logo';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule, WalletLogoComponent],
  animations: [
    trigger('scaleIn', [transition(':enter', [style({ transform: 'scale(0.6)', opacity: 0 }), animate('500ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))])]),
    trigger('slideUp', [transition(':enter', [style({ opacity: 0, transform: 'translateY(8px)' }), animate('400ms 200ms ease', style({ opacity: 1, transform: 'translateY(0)' }))])])
  ],
  template: `
    <div class="flex h-full w-full flex-col items-center justify-center gap-6 bg-gradient-surface">
      <div [@scaleIn]><app-wallet-logo [size]="96"></app-wallet-logo></div>
      <div [@slideUp] class="text-center">
        <h1 class="text-3xl font-semibold tracking-tight">PayDay</h1>
        <p class="mt-1 text-sm text-muted-foreground">Own every rupee.</p>
      </div>
    </div>
  `
})
export class SplashScreenComponent {}