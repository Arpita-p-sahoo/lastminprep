import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../models';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';
import { Observable, map } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'lmp_user';
  private readonly TOKEN_KEY = 'lmp_token';
  private readonly API = environment.apiUrl;

  currentUser = signal<User | null>(this.loadUser());
  isLoggedIn = signal<boolean>(!!this.loadUser());

  constructor(private router: Router, private http: HttpClient, private toast: ToastService) { }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private normalizeUser(u: any): User {
    return {
      id: u.id ?? u._id ?? '',
      name: u.name ?? '',
      email: u.email ?? '',
      avatar: u.avatar ?? u.avatarUrl ?? '',
      bannerUrl: u.bannerUrl ?? '',
      designation: u.designation ?? '',
      organisation: u.organisation ?? '',
      address: u.address ?? '',
      highestEducation: u.highestEducation ?? '',
      experience: u.experience ?? '',
      age: Number(u.age ?? 0),
      gender: u.gender ?? '',
      dob: u.dob ?? '',
      linkedinUrl: u.linkedinUrl ?? '',
      techStack: Array.isArray(u.techStack) ? u.techStack : (u.techStack ? String(u.techStack).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      streak: Number(u.streak ?? 0),
      answeredCount: Number(u.answeredCount ?? u.answersCount ?? u.answerCount ?? u.questionsAnswered ?? u.answered ?? 0),
      questionsPosted: Number(u.questionsPosted ?? 0),
      totalVotes: Number(u.totalVotes ?? 0),
      joinedAt: (u.joinedAt || u.createdAt) ? new Date(u.joinedAt || u.createdAt) : new Date(),
    };
  }

  fetchUserById(id: string): Observable<User> {
    return this.http.get<any>(`${this.API}/users/${id}`).pipe(
      map(res => this.normalizeUser(res?.data ?? res?.item ?? res?.user ?? res))
    );
  }

  updateLocalUser(partial: Partial<User>): void {
    const existing = this.currentUser();
    if (!existing) return;
    const merged: any = { ...existing, ...partial };
    const normalized = this.normalizeUser(merged);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(normalized));
    this.currentUser.set(normalized);
  }

  private saveSession(user: User, token?: string): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  private getErrorMessage(err: any, fallback: string): string {
    const msg = err?.error?.message ?? err?.message;
    if (Array.isArray(msg)) return msg.filter(Boolean).join(', ') || fallback;
    if (typeof msg === 'string' && msg.trim()) return msg;
    return fallback;
  }

  login(email: string, password: string): void {
    this.http.post<any>(`${this.API}/auth/login`, { email, password }).subscribe({
      next: res => {
        const token = res?.accessToken ?? res?.access_token ?? res?.token ?? '';
        const user = this.normalizeUser(res?.user ?? res);
        this.saveSession(user, token);
        this.toast.success(`Welcome, ${user.name || 'back'}`);
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.toast.error(this.getErrorMessage(err, 'Login failed'));
      },
    });
  }

  loginWithGoogle(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  signup(userData: Partial<User> & { password: string; avatarUrl?: string }): void {
    const payload: any = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      designation: userData.designation,
      organisation: userData.organisation,
      experience: userData.experience,
      age: userData.age,
      gender: userData.gender,
      dob: userData.dob,
      avatarUrl: (userData as any).avatarUrl,
      linkedinUrl: userData.linkedinUrl,
      techStack: userData.techStack,
    };

    const req = this.http.post<any>(`${this.API}/auth/signup`, payload);
    req.subscribe({
      next: res => {
        const token = res?.accessToken ?? res?.access_token ?? res?.token ?? '';
        const user = this.normalizeUser(res?.user ?? res);
        this.saveSession(user, token);
        this.toast.success('Account created');
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        if (err?.status === 404) {
          this.http.post<any>(`${this.API}/auth/register`, payload).subscribe({
            next: res2 => {
              const token = res2?.accessToken ?? res2?.access_token ?? res2?.token ?? '';
              const user = this.normalizeUser(res2?.user ?? res2);
              this.saveSession(user, token);
              this.toast.success('Account created');
              this.router.navigate(['/dashboard']);
            },
            error: err2 => {
              this.toast.error(this.getErrorMessage(err2, 'Signup failed'));
            },
          });
        } else {
          this.toast.error(this.getErrorMessage(err, 'Signup failed'));
        }
      },
    });
  }

  updateProfile(
    userData: Partial<User> & { avatarUrl?: string },
    callbacks?: { onSuccess?: () => void; onError?: (message: string) => void }
  ): void {
    const existing = this.currentUser();
    if (!existing) {
      const msg = 'Please login to edit your profile';
      this.toast.error(msg);
      callbacks?.onError?.(msg);
      return;
    }

    const payload: any = {
      name: userData.name ?? existing.name,
      designation: userData.designation ?? existing.designation,
      organisation: userData.organisation ?? existing.organisation,
      address: userData.address ?? existing.address,
      highestEducation: userData.highestEducation ?? existing.highestEducation,
      experience: userData.experience ?? existing.experience,
      age: typeof userData.age === 'number' ? userData.age : existing.age,
      gender: userData.gender ?? existing.gender,
      dob: userData.dob ?? existing.dob,
      avatarUrl: (userData as any).avatarUrl ?? existing.avatar ?? '',
      bannerUrl: (userData as any).bannerUrl ?? existing.bannerUrl ?? '',
      linkedinUrl: userData.linkedinUrl ?? existing.linkedinUrl,
      techStack: userData.techStack ?? existing.techStack,
    };

    const token = localStorage.getItem(this.TOKEN_KEY) || '';
    const updateFromResponse = (res: any) => {
      const merged = { ...existing, ...(res?.user ?? res) };
      const updated = this.normalizeUser(merged);
      this.saveSession(updated, token);
      this.toast.success('Profile updated');
      callbacks?.onSuccess?.();
    };

    const fail = (err: any) => {
      const msg = this.getErrorMessage(err, 'Profile update failed');
      this.toast.error(msg);
      callbacks?.onError?.(msg);
    };

    this.http.patch<any>(`${this.API}/users/me`, payload).subscribe({
      next: updateFromResponse,
      error: err => {
        if (err?.status === 404) {
          this.http.patch<any>(`${this.API}/users/profile`, payload).subscribe({
            next: updateFromResponse,
            error: err2 => {
              if (err2?.status === 404) {
                this.http.patch<any>(`${this.API}/users/${existing.id}`, payload).subscribe({
                  next: updateFromResponse,
                  error: fail,
                });
              } else {
                fail(err2);
              }
            },
          });
        } else {
          fail(err);
        }
      },
    });
  }
}
