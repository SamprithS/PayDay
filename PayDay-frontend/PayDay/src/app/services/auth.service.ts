import { Injectable, signal } from '@angular/core';
import { User, AuthResponse } from '../models/user.model';
import { ApiService } from './api.service';

declare const google: any;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  private _googleAccessToken = signal<string | null>(null);
  readonly user = this._user.asReadonly();

  constructor(private api: ApiService) {
    const stored = localStorage.getItem('payday_user');
    if (stored) { try { this._user.set(JSON.parse(stored)); } catch { localStorage.clear(); } }
  }

  isLoggedIn(): boolean { return this._user() !== null && !!localStorage.getItem('payday_token'); }

  handleGoogleCredential(credential: string, googleAccessToken: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.api.googleSignIn(credential, googleAccessToken).subscribe({
        next: (res: AuthResponse) => {
          const user: User = { googleId: res.googleId, email: res.email, name: res.name, picture: res.picture, driveFolderId: res.driveFolderId };
          this._user.set(user);
          this._googleAccessToken.set(googleAccessToken);
          localStorage.setItem('payday_token', res.token);
          localStorage.setItem('payday_user', JSON.stringify(user));
          resolve();
        },
        error: reject
      });
    });
  }

  signOut(): void {
    this._user.set(null);
    this._googleAccessToken.set(null);
    localStorage.removeItem('payday_token');
    localStorage.removeItem('payday_user');
    if (typeof google !== 'undefined') google.accounts.id.disableAutoSelect();
  }

  getGoogleAccessToken(): string | null {
    return this._googleAccessToken() ?? sessionStorage.getItem('g_access_token');
  }
}