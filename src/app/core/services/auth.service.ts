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
  private restoring = false;

  currentUser = signal<User | null>(this.loadUser());
  isLoggedIn = signal<boolean>(!!this.loadUser() || !!this.loadToken());

  constructor(private router: Router, private http: HttpClient, private toast: ToastService) {
    const token = this.loadToken();
    if (!this.currentUser() && token) this.restoreSessionFromToken(token);
  }

  private normalizeGender(value: any): 'male' | 'female' | '' {
    const g = String(value ?? '').trim().toLowerCase();
    if (!g) return '';
    if (g.includes('female') || g === 'f') return 'female';
    if (g.includes('male') || g === 'm') return 'male';
    return '';
  }

  private avatarIndex(seed: string): number {
    const s = String(seed ?? '').trim();
    if (!s) return 0;
    let h = 0;
    for (let i = 0; i < s.length; i += 1) {
      h = (h * 31 + s.charCodeAt(i)) >>> 0;
    }
    return h % 100;
  }

  private defaultAvatarUrl(seed: string, gender: any): string {
    const g = this.normalizeGender(gender);
    if (!g) return '';
    const idx = this.avatarIndex(seed);
    const group = g === 'female' ? 'women' : 'men';
    return `https://randomuser.me/api/portraits/${group}/${idx}.jpg`;
  }

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private loadToken(): string {
    try {
      return String(localStorage.getItem(this.TOKEN_KEY) || '').trim();
    } catch {
      return '';
    }
  }

  private normalizeUser(u: any): User {
    const gender = u?.gender ?? '';
    const rawAvatar = String(u?.avatar ?? u?.avatarUrl ?? '').trim();
    const seed = String(u?.email ?? u?.name ?? u?.id ?? u?._id ?? '').trim();
    const avatar = rawAvatar || this.defaultAvatarUrl(seed, gender);
    return {
      id: u.id ?? u._id ?? '',
      name: u.name ?? '',
      email: u.email ?? '',
      avatar,
      bannerUrl: u.bannerUrl ?? '',
      designation: u.designation ?? '',
      organisation: u.organisation ?? '',
      address: u.address ?? '',
      highestEducation: u.highestEducation ?? '',
      experience: u.experience ?? '',
      age: Number(u.age ?? 0),
      gender,
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

  private restoreSessionFromToken(token: string): void {
    if (this.restoring) return;
    this.restoring = true;

    this.http.get<any>(`${this.API}/users/me`, { headers: this.getAuthHeaders() }).subscribe({
      next: res => {
        const normalized = this.normalizeUser(res?.data ?? res?.item ?? res?.user ?? res);
        this.saveSession(normalized, token);
        this.restoring = false;
      },
      error: err => {
        if (err?.status === 401 || err?.status === 403) {
          localStorage.removeItem(this.TOKEN_KEY);
          this.currentUser.set(null);
          this.isLoggedIn.set(false);
        }
        this.restoring = false;
      },
    });
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
    if (this.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    const url = (environment as any).googleAuthUrl || `${this.API}/auth/google`;
    if (typeof window === 'undefined') return;
    window.location.assign(url);
  }

  signupWithGoogle(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }
    const url = (environment as any).googleAuthSignupUrl || `${this.API}/auth/google/signup`;
    if (typeof window === 'undefined') return;
    window.location.assign(url);
  }

  completeGoogleOAuth(params?: { token?: string; returnTo?: string }): void {
    const token = String(params?.token ?? '').trim();
    const returnTo = String(params?.returnTo ?? '/dashboard').trim() || '/dashboard';

    if (token) localStorage.setItem(this.TOKEN_KEY, token);

    const withCredentials = !token;
    this.http.get<any>(`${this.API}/users/me`, { headers: this.getAuthHeaders(), withCredentials }).subscribe({
      next: res => {
        const normalized = this.normalizeUser(res?.data ?? res?.item ?? res?.user ?? res);
        const storedToken = token || localStorage.getItem(this.TOKEN_KEY) || '';
        this.saveSession(normalized, storedToken);
        this.router.navigate([returnTo]);
      },
      error: err => {
        this.toast.error(this.getErrorMessage(err, 'Google login failed'));
        this.router.navigate(['/login']);
      },
    });
  }

  uploadAvatar(file: File): Observable<string> {
    const endpoint = (environment as any).avatarUploadUrl || `${this.API}/uploads/avatar`;
    const form = new FormData();
    form.append('file', file);
    return this.http.post<any>(endpoint, form).pipe(map(res => this.extractUploadedUrl(res)));
  }

  private extractUploadedUrl(res: any): string {
    const candidates = [
      res?.url,
      res?.secure_url,
      res?.data?.url,
      res?.data?.secure_url,
      res?.item?.url,
      res?.result?.url,
      res?.result?.secure_url,
    ];
    const url = candidates.find(v => typeof v === 'string' && v.trim());
    return String(url ?? '').trim();
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  deleteAccount(callbacks?: { onSuccess?: () => void; onError?: (message: string) => void }): void {
    const existing = this.currentUser();
    if (!existing) {
      const msg = 'Please login to delete your account';
      this.toast.error(msg);
      callbacks?.onError?.(msg);
      return;
    }

    const done = () => {
      this.toast.success('Account deleted');
      this.logout();
      callbacks?.onSuccess?.();
    };

    const fail = (err: any) => {
      const msg = this.getErrorMessage(err, 'Delete account failed');
      this.toast.error(msg);
      callbacks?.onError?.(msg);
    };

    this.http.delete<any>(`${this.API}/users/me`).subscribe({
      next: done,
      error: err => {
        if (err?.status === 404) {
          this.http.delete<any>(`${this.API}/users/profile`).subscribe({
            next: done,
            error: err2 => {
              if (err2?.status === 404) {
                this.http.delete<any>(`${this.API}/users/${existing.id}`).subscribe({
                  next: done,
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

  signup(userData: Partial<User> & { password: string; avatarUrl?: string }): void {
    const seed = String(userData.email ?? userData.name ?? '').trim();
    const avatarUrl =
      String((userData as any).avatarUrl ?? '').trim() || this.defaultAvatarUrl(seed, userData.gender);
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
      avatarUrl,
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
