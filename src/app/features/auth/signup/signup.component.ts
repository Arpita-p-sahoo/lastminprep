import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
    avatarUrl: '',
    linkedinUrl: '',
    techStack: [] as string[],
  };

  error = '';
  techQuery = '';
  techOpen = false;

  constructor() {
    this.tagOptions.ensureLoaded();
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
    const age = this.form.age === null ? undefined : Number(this.form.age);
    if (!this.form.email?.trim()) { this.error = 'Email is required'; return; }
    if (!this.form.password || this.form.password.length < 6) { this.error = 'Password must be at least 6 characters'; return; }
    if (!this.form.name?.trim()) { this.error = 'Name is required'; return; }
    if (age !== undefined && (!Number.isInteger(age) || age < 16 || age > 100)) {
      this.error = 'Age must be an integer between 16 and 100';
      return;
    }
    const techStack = this.form.techStack.length ? this.form.techStack : undefined;

    this.auth.signup({
      name: this.form.name.trim(),
      email: this.form.email.trim(),
      password: this.form.password,
      designation: this.form.designation || undefined,
      organisation: this.form.organisation || undefined,
      experience: this.form.experience || undefined,
      age: age,
      gender: this.form.gender || undefined,
      dob: this.form.dob || undefined,
      avatarUrl: this.form.avatarUrl || undefined,
      linkedinUrl: this.form.linkedinUrl || undefined,
      techStack,
    });
  }
}
