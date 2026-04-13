import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_KEY = 'lmp_user';

  currentUser = signal<User | null>(this.loadUser());
  isLoggedIn = signal<boolean>(!!this.loadUser());

  constructor(private router: Router) {}

  private loadUser(): User | null {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  login(email: string, _password: string): void {
    // TODO: replace with real API call
    const mockUser: User = {
      id: '1',
      name: 'Arpita Sahoo',
      email,
      designation: 'Frontend Developer',
      organisation: 'Current Company',
      experience: '3-5 yrs',
      age: 25,
      gender: 'Female',
      dob: '1999-01-01',
      linkedinUrl: 'https://linkedin.com/in/arpitasahoo',
      techStack: ['Angular', 'TypeScript', 'NestJS', 'Node.js'],
      streak: 7,
      questionsPosted: 12,
      totalVotes: 284,
      joinedAt: new Date(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mockUser));
    this.currentUser.set(mockUser);
    this.isLoggedIn.set(true);
    this.router.navigate(['/dashboard']);
  }

  loginWithGoogle(): void {
    // TODO: implement Google OAuth
    this.login('arpita@email.com', '');
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  signup(userData: Partial<User> & { password: string }): void {
    // TODO: replace with real API call
    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name || '',
      email: userData.email || '',
      designation: userData.designation || '',
      organisation: userData.organisation || '',
      experience: userData.experience || '',
      age: userData.age || 0,
      gender: userData.gender || '',
      dob: userData.dob || '',
      linkedinUrl: userData.linkedinUrl || '',
      techStack: [],
      streak: 0,
      questionsPosted: 0,
      totalVotes: 0,
      joinedAt: new Date(),
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newUser));
    this.currentUser.set(newUser);
    this.isLoggedIn.set(true);
    this.router.navigate(['/dashboard']);
  }
}
