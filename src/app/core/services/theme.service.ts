import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(false);

  init(): void {
    const saved = localStorage.getItem('lmp_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    this.setDark(dark);
  }

  toggle(): void {
    this.setDark(!this.isDark());
  }

  private setDark(dark: boolean): void {
    this.isDark.set(dark);
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('lmp_theme', dark ? 'dark' : 'light');
  }
}
