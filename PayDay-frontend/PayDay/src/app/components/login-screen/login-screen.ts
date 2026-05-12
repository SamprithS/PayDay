import { Component, Output, EventEmitter, AfterViewInit, OnDestroy, ElementRef, ViewChild, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { WalletLogoComponent } from '../wallet-logo/wallet-logo';
import { environment } from '../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login-screen',
  standalone: true,
  imports: [CommonModule, WalletLogoComponent],
  animations: [trigger('fadeIn', [transition(':enter', [style({ opacity: 0 }), animate('400ms ease', style({ opacity: 1 }))])])],
  template: `
    <div [@fadeIn] class="flex h-full w-full flex-col items-center justify-between bg-gradient-surface p-8">
      <div class="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <app-wallet-logo [size]="84"></app-wallet-logo>
        <div>
          <h1 class="text-3xl font-semibold tracking-tight">Welcome to PayDay</h1>
          <p class="mt-2 max-w-xs text-sm text-muted-foreground">Track your income, plan your spending, and watch your savings grow — all in one calm place.</p>
        </div>
      </div>
      <div class="w-full max-w-sm space-y-3">
        <button (click)="triggerGoogleSignIn()"
                class="w-full flex items-center justify-center gap-3 rounded-2xl bg-card border border-border text-base font-medium shadow-soft hover:bg-secondary px-6 py-3 transition">
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.5 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12s4.2 9.5 9.4 9.5c5.4 0 9-3.8 9-9.2 0-.6-.1-1.1-.2-1.6H12z"/></svg>
          Continue with Google
        </button>
        <p class="text-center text-xs text-muted-foreground">By continuing you agree to manage your money mindfully ✨</p>
      </div>
      <div #googleBtn style="display:none"></div>
    </div>
  `
})
export class LoginScreenComponent implements AfterViewInit, OnDestroy {
  @Output() signedIn = new EventEmitter<void>();
  @ViewChild('googleBtn') googleBtnRef!: ElementRef;
  private tokenClient: any;
  private pendingCredential: string | null = null;
  constructor(private ngZone: NgZone) {}
  ngAfterViewInit(): void { this.waitForGoogle(); }
  private waitForGoogle(): void { if (typeof google !== 'undefined') this.initGoogle(); else setTimeout(() => this.waitForGoogle(), 200); }
  private initGoogle(): void {
    google.accounts.id.initialize({ client_id: environment.googleClientId, callback: (r: any) => this.ngZone.run(() => this.handleCredential(r.credential)), auto_select: false });
    google.accounts.id.renderButton(this.googleBtnRef.nativeElement, { theme: 'outline', size: 'large' });
    this.tokenClient = google.accounts.oauth2.initTokenClient({ client_id: environment.googleClientId, scope: 'https://www.googleapis.com/auth/drive.file', callback: (r: any) => this.ngZone.run(() => this.onAccessToken(r.access_token)) });
  }
  private handleCredential(credential: string): void { this.pendingCredential = credential; this.tokenClient.requestAccessToken({ prompt: '' }); }
  private onAccessToken(accessToken: string): void { if (!this.pendingCredential) return; sessionStorage.setItem('g_access_token', accessToken); sessionStorage.setItem('g_credential', this.pendingCredential); this.signedIn.emit(); }
  triggerGoogleSignIn(): void { if (typeof google !== 'undefined') google.accounts.id.prompt(); }
  ngOnDestroy(): void {}
}