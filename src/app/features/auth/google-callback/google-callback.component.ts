import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;">
      @if (error()) {
        <div style="max-width:520px;width:100%;background:var(--card);border:1px solid var(--border);border-radius:14px;padding:22px;box-shadow:var(--shadow);">
          @if (signupRequired()) {
            <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;">Please sign up with Google first</div>
            <div style="font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:14px;">
              Your Google account is not linked yet. Create your account with Google and then you can sign in next time.
            </div>
            <button (click)="goToSignup()"
              style="width:100%;background:var(--accent);color:#fff;border:none;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;">
              Go to Sign up →
            </button>
          } @else {
            <div style="font-size:18px;font-weight:800;letter-spacing:-0.02em;margin-bottom:8px;">Sign-in failed</div>
            <div style="font-size:13px;color:var(--ink2);line-height:1.6;margin-bottom:14px;">
              Something went wrong while signing you in.
            </div>
            <div style="font-size:12px;color:var(--ink3);line-height:1.6;margin-bottom:14px;word-break:break-word;">
              {{ error() }}
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <button (click)="goToLogin()"
                style="flex:1;min-width:170px;background:var(--bg);color:var(--ink);border:1px solid var(--border);border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;">
                Back to Login
              </button>
              <button (click)="retryLogin()"
                style="flex:1;min-width:170px;background:var(--accent);color:#fff;border:none;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;">
                Retry Google Login →
              </button>
            </div>
          }
        </div>
      } @else {
        <div style="color:var(--ink2);font-size:13px;">Signing you in…</div>
      }
    </div>
  `,
})
export class GoogleCallbackComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  error = signal('');
  signupRequired = signal(false);

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    const err = qp.get('error') || qp.get('message') || '';
    if (err) {
      this.error.set(err);
      const normalized = err.toLowerCase();
      const needsSignup =
        normalized.includes('user not found') ||
        normalized.includes('not linked') ||
        normalized.includes('please sign up') ||
        normalized.includes('please signup') ||
        normalized.includes('signup first');
      this.signupRequired.set(needsSignup);
      return;
    }
    const token =
      qp.get('token') ||
      qp.get('accessToken') ||
      qp.get('access_token') ||
      qp.get('jwt') ||
      '';

    const returnTo = qp.get('returnTo') || qp.get('next') || '/dashboard';

    this.auth.completeGoogleOAuth({ token, returnTo });
  }

  goToSignup(): void {
    this.router.navigate(['/signup']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  retryLogin(): void {
    this.auth.loginWithGoogle();
  }
}
