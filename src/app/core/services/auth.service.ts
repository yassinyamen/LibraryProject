import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppUser, UserRole } from '../models/user.model';

export interface LoginResponse {
  token: string;
  userId: string;
  role: UserRole;
}

const STORAGE_KEY = 'library_auth';

interface StoredAuth {
  token: string;
  userId: string;
  role: UserRole;
  email: string;
}

/**
 * Simplified auth for this project: no password, just exchanges a known
 * seeded email for a JWT (matches the backend's POST /api/auth/token).
 * The token is sent on the standard Authorization: Bearer header
 * (see auth.interceptor.ts).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly authState = signal<StoredAuth | null>(this.readFromStorage());

  readonly isLoggedIn = computed(() => this.authState() !== null);
  readonly currentRole = computed<UserRole | null>(() => this.authState()?.role ?? null);
  readonly currentUserId = computed<string | null>(() => this.authState()?.userId ?? null);
  readonly currentEmail = computed<string | null>(() => this.authState()?.email ?? null);
  readonly isAdmin = computed(() => this.currentRole() === 'Admin');

  constructor(private http: HttpClient) {}

  login(email: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/token`, { email }).pipe(
      tap((res) => {
        const stored: StoredAuth = { token: res.token, userId: res.userId, role: res.role, email };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
        this.authState.set(stored);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.authState.set(null);
  }

  getToken(): string | null {
    return this.authState()?.token ?? null;
  }

  private readFromStorage(): StoredAuth | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredAuth;
    } catch {
      return null;
    }
  }
}
