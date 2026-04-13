import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDark = signal<boolean>(true);

  init(): void {
    const saved = localStorage.getItem('lmp_theme');
    const dark = saved ? saved === 'dark' : true;
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
