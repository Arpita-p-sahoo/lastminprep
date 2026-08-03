import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TagOptionsService } from '../../../core/services/tag-options.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  host: { '(document:click)': 'handleDocClick($event)' }
})
export class SignupComponent {
  auth = inject(AuthService);
  tagOptions = inject(TagOptionsService);
  private readonly route = inject(ActivatedRoute);
  returnTo = this.route.snapshot.queryParamMap.get('returnTo') || '/dashboard';
  @ViewChild('techWrap') techWrap?: ElementRef<HTMLElement>;
  form = {
    name: '',
    email: '',
    password: '',
    designation: '',
    organisation: '',
    experience: '',
    age: null as number | null,
    gender: '',
    dob: '',
    linkedinUrl: '',
    techStack: [] as string[],
  };

  error = '';
  warning = '';
  techQuery = '';
  techOpen = false;

  constructor() {
    this.tagOptions.ensureLoaded();
  }

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

  private isValidHttpUrl(raw: string): boolean {
    const v = String(raw || '').trim();
    if (!v) return true;
    if (v.length > 2048) return false;
    try {
      const u = new URL(v);
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private yearsFromDob(dob: string): number | null {
    const v = String(dob || '').trim();
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    if (d.getTime() > now.getTime()) return null;
    let years = now.getFullYear() - d.getFullYear();
    const m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) years -= 1;
    return years;
  }

  signupWithGoogle(): void {
    this.auth.signupWithGoogle(this.returnTo);
  }

  addTech(tag: string): void {
    if (!this.form.techStack.includes(tag)) {
      this.form.techStack = [...this.form.techStack, tag];
    }
    this.techQuery = '';
    this.techOpen = true;
  }

  removeTech(tag: string): void {
    this.form.techStack = this.form.techStack.filter(t => t !== tag);
  }

  filteredTech(): string[] {
    const q = this.techQuery.toLowerCase().trim();
    const options = this.tagOptions.tags();
    const base = q ? options.filter(t => t.toLowerCase().includes(q)) : options.slice(0, 12);
    return base.filter(t => !this.form.techStack.includes(t));
  }
  handleDocClick(event: Event): void {
    if (!this.techOpen) return;
    const el = this.techWrap?.nativeElement;
    if (el && !el.contains(event.target as Node)) this.techOpen = false;
  }

  signup(): void {
    this.error = '';
    this.warning = '';

    const name = String(this.form.name || '').trim();
    const email = this.normalizeEmail(this.form.email);
    const password = String(this.form.password || '');

    const age = this.form.age === null ? undefined : Number(this.form.age);

    if (!name) { this.error = 'Name is required'; return; }
    if (name.length < 2) { this.error = 'Name must be at least 2 characters'; return; }
    if (name.length > 80) { this.error = 'Name must be 80 characters or less'; return; }

    if (!email) { this.error = 'Email is required'; return; }
    if (!this.isValidEmail(email)) { this.error = 'Please enter a valid email address'; return; }
    const hint = this.emailTypoHint(email);
    if (hint) this.warning = hint;

    if (!password) { this.error = 'Password is required'; return; }
    if (password.length < 6) { this.error = 'Password must be at least 6 characters'; return; }
    if (password.length > 128) { this.error = 'Password must be 128 characters or less'; return; }

    if (age !== undefined && (!Number.isInteger(age) || age < 16 || age > 100)) {
      this.error = 'Age must be an integer between 16 and 100';
      return;
    }

    const dobYears = this.yearsFromDob(this.form.dob);
    if (this.form.dob && dobYears === null) {
      this.error = 'Please enter a valid date of birth';
      return;
    }
    if (dobYears !== null && (dobYears < 13 || dobYears > 110)) {
      this.error = 'Please enter a valid date of birth';
      return;
    }
    if (age !== undefined && dobYears !== null && Math.abs(age - dobYears) > 1) {
      this.error = 'Age and date of birth do not match';
      return;
    }

    const designation = String(this.form.designation || '').trim();
    if (designation && designation.length > 80) { this.error = 'Designation must be 80 characters or less'; return; }

    const organisation = String(this.form.organisation || '').trim();
    if (organisation && organisation.length > 80) { this.error = 'Organisation must be 80 characters or less'; return; }

    const linkedinUrl = String(this.form.linkedinUrl || '').trim();
    if (!this.isValidHttpUrl(linkedinUrl)) { this.error = 'Please enter a valid LinkedIn URL'; return; }

    const techStackClean = (this.form.techStack || []).map(t => String(t || '').trim()).filter(Boolean);
    if (techStackClean.length > 20) { this.error = 'Please limit tech stack to 20 items'; return; }
    if (techStackClean.some(t => t.length > 30)) { this.error = 'Each tech stack item must be 30 characters or less'; return; }
    const techStack = techStackClean.length ? techStackClean : undefined;

    this.auth.signup({
      name,
      email,
      password,
      designation: designation || undefined,
      organisation: organisation || undefined,
      experience: this.form.experience || undefined,
      age: age,
      gender: this.form.gender || undefined,
      dob: this.form.dob || undefined,
      linkedinUrl: linkedinUrl || undefined,
      techStack,
    }, this.returnTo);
  }
}
