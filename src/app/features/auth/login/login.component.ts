import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  returnTo = this.route.snapshot.queryParamMap.get('returnTo') || '/dashboard';
  email = '';
  password = '';
  error = '';
  warning = '';

  private normalizeEmail(raw: string): string {
    return String(raw || '').trim().toLowerCase();
  }

  private isValidEmail(email: string): boolean {
    if (!email) return false;
    if (email.length > 254) return false;
    const at = email.lastIndexOf('@');
    if (at <= 0 || at === email.length - 1) return false;
    const local = email.slice(0, at);
    const domain = email.slice(at + 1);
    if (!local || !domain) return false;
    if (local.length > 64) return false;
    if (domain.length > 253) return false;
    if (!domain.includes('.')) return false;
    if (/\s/.test(email)) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  private emailTypoHint(email: string): string {
    const domain = email.split('@')[1] || '';
    const map: Record<string, string> = {
      'gmeil.com': 'gmail.com',
      'gmial.com': 'gmail.com',
      'gnail.com': 'gmail.com',
      'hotmial.com': 'hotmail.com',
      'outlok.com': 'outlook.com',
      'yaho.com': 'yahoo.com',
      'yhoo.com': 'yahoo.com',
    };
    const suggestion = map[domain.toLowerCase()];
    if (!suggestion) return '';
    return `Did you mean ${suggestion}?`;
  }

  login(): void {
    this.error = '';
    this.warning = '';

    const email = this.normalizeEmail(this.email);
    if (!email) {
      this.error = 'Email is required';
      return;
    }
    if (!this.isValidEmail(email)) {
      this.error = 'Please enter a valid email address';
      return;
    }
    const hint = this.emailTypoHint(email);
    if (hint) this.warning = hint;

    if (!this.password) {
      this.error = 'Password is required';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters';
      return;
    }

    this.auth.login(email, this.password, this.returnTo);
  }

  loginWithGoogle(): void {
    this.auth.loginWithGoogle(this.returnTo);
  }
}
