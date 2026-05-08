import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { SplashScreenComponent } from './components/splash-screen/splash-screen.component';
import { LoginScreenComponent } from './components/login-screen/login-screen.component';
import { AppShellComponent } from './components/app-shell/app-shell.component';
import { AuthService } from './services/auth.service';

type Stage = 'splash' | 'login' | 'app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, SplashScreenComponent, LoginScreenComponent, AppShellComponent],
  animations: [
    trigger('stageFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('400ms ease', style({ opacity: 0 }))
      ])
    ])
  ],
  template: `
    <main class="flex min-h-screen w-full items-center justify-center bg-background p-0 sm:p-6">
      <div class="relative h-[100dvh] w-full overflow-hidden bg-card sm:h-[85vh] sm:max-h-[860px] sm:w-[420px] sm:rounded-[2.25rem] sm:shadow-card">
        <ng-container [ngSwitch]="stage()">
          <app-splash-screen *ngSwitchCase="'splash'" [@stageFade]></app-splash-screen>
          <app-login-screen  *ngSwitchCase="'login'"  [@stageFade] (signedIn)="onSignedIn()"></app-login-screen>
          <app-app-shell     *ngSwitchCase="'app'"    [@stageFade] (signedOut)="stage.set('login')"></app-app-shell>
        </ng-container>
      </div>
    </main>
  `
})
export class App implements OnInit {
  stage = signal<Stage>('splash');

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    setTimeout(() => {
      this.stage.set(this.auth.isLoggedIn() ? 'app' : 'login');
    }, 1100);
  }

  onSignedIn(): void {
    const credential = sessionStorage.getItem('g_credential');
    const accessToken = sessionStorage.getItem('g_access_token');
    if (!credential || !accessToken) { alert('Sign-in failed. Please try again.'); return; }
    this.auth.handleGoogleCredential(credential, accessToken).then(() => {
      sessionStorage.removeItem('g_credential');
      sessionStorage.removeItem('g_access_token');
      this.stage.set('app');
    }).catch(() => alert('Sign in failed. Please try again.'));
  }
}