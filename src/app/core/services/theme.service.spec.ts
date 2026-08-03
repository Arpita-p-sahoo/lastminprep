import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  it('toggles dark mode and persists to localStorage', () => {
    localStorage.removeItem('lmp_theme');
    document.documentElement.classList.remove('dark');

    const svc = new ThemeService();
    svc.init();

    expect(typeof svc.isDark()).toBe('boolean');
    expect(localStorage.getItem('lmp_theme')).toBe(svc.isDark() ? 'dark' : 'light');

    const prev = svc.isDark();
    svc.toggle();
    expect(svc.isDark()).toBe(!prev);
    expect(localStorage.getItem('lmp_theme')).toBe(svc.isDark() ? 'dark' : 'light');
  });
});

