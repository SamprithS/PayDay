import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MonthBudget, Expense } from '../models/budget.model';
import { AuthResponse } from '../models/user.model';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  private headers(googleAccessToken?: string): HttpHeaders {
    const token = localStorage.getItem('payday_token');
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (token) h = h.set('Authorization', `Bearer ${token}`);
    if (googleAccessToken) h = h.set('X-Google-Access-Token', googleAccessToken);
    return h;
  }

  googleSignIn(credential: string, googleAccessToken: string): Observable<AuthResponse> {
    return this.http.post<ApiResponse<AuthResponse>>(`${this.base}/auth/google`, { credential }, { headers: this.headers(googleAccessToken) }).pipe(map(r => r.data));
  }

  getBudget(year: number, month: number): Observable<MonthBudget> {
    return this.http.get<ApiResponse<MonthBudget>>(`${this.base}/budget?year=${year}&month=${month}`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  updateBudget(year: number, month: number, budget: Partial<MonthBudget>): Observable<MonthBudget> {
    return this.http.put<ApiResponse<MonthBudget>>(`${this.base}/budget?year=${year}&month=${month}`, budget, { headers: this.headers() }).pipe(map(r => r.data));
  }

  getExpenses(year: number, month: number): Observable<Expense[]> {
    return this.http.get<ApiResponse<Expense[]>>(`${this.base}/expenses?year=${year}&month=${month}`, { headers: this.headers() }).pipe(map(r => r.data));
  }

  addExpense(expense: Omit<Expense, 'id'>): Observable<Expense> {
    return this.http.post<ApiResponse<Expense>>(`${this.base}/expenses`, expense, { headers: this.headers() }).pipe(map(r => r.data));
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.base}/expenses/${id}`, { headers: this.headers() }).pipe(map(() => void 0));
  }

  uploadBill(file: File, googleAccessToken: string): Observable<string> {
    const token = localStorage.getItem('payday_token');
    const formData = new FormData();
    formData.append('file', file);
    const h = new HttpHeaders({ 'Authorization': `Bearer ${token}`, 'X-Google-Access-Token': googleAccessToken });
    return this.http.post<ApiResponse<string>>(`${this.base}/expenses/upload-bill`, formData, { headers: h }).pipe(map(r => r.data));
  }
}