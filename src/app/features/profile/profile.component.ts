import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { AuthService } from '../../core/services/auth.service';
import { QuestionService } from '../../core/services/question.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  host: { '(document:keydown.escape)': 'handleEscape()' },
})
export class ProfileComponent {
  auth = inject(AuthService);
  qs = inject(QuestionService);
  toast = inject(ToastService);
  userService = inject(UserService);
  router = inject(Router);
  drawerOpen = signal(false);
  postOpen = signal(false);
  editOpen = signal(false);
  saving = signal(false);
  uploadingAvatar = signal(false);
  uploadingBanner = signal(false);
  avatarUploadOpen = signal(false);
  avatarDragActive = signal(false);
  bannerUploadOpen = signal(false);
  bannerDragActive = signal(false);
  private avatarPreviewObjectUrl = '';
  private bannerPreviewObjectUrl = '';
  form = {
    name: '',
    designation: '',
    organisation: '',
    address: '',
    highestEducation: '',
    experience: '',
    age: null as number | null,
    gender: '',
    dob: '',
    avatarUrl: '',
    bannerUrl: '',
    linkedinUrl: '',
    techStackText: '',
  };
  avatarMenuOpen = signal(false);
  bannerMenuOpen = signal(false);
  myQuestions = () => {
    const id = this.auth.currentUser()?.id ?? '';
    return this.qs.getByAuthor(id);
  };
  activeTab = signal<'Questions' | 'Following' | 'Followers'>('Questions');

  constructor() {
    this.userService.loadMyFollowing();
    this.userService.loadMyFollowers();
  }

  goToUser(id: string): void {
    if (!id) return;
    this.router.navigate(['/user', id]);
  }

  toggleEdit(): void {
    if (this.editOpen()) {
      this.cancelEdit();
      return;
    }
    this.openEdit();
  }

  joinedLabel(): string {
    const raw = this.auth.currentUser()?.joinedAt;
    if (!raw) return '';
    const d = raw instanceof Date ? raw : new Date(raw as any);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString(undefined, { month: 'short', year: 'numeric' });
  }

  openEdit(): void {
    const u = this.auth.currentUser();
    if (!u) return;
    this.form = {
      name: u.name ?? '',
      designation: u.designation ?? '',
      organisation: u.organisation ?? '',
      address: u.address ?? '',
      highestEducation: u.highestEducation ?? '',
      experience: u.experience ?? '',
      age: typeof u.age === 'number' ? u.age : null,
      gender: u.gender ?? '',
      dob: u.dob ?? '',
      avatarUrl: u.avatar ?? '',
      bannerUrl: u.bannerUrl ?? '',
      linkedinUrl: u.linkedinUrl ?? '',
      techStackText: (u.techStack ?? []).join(', '),
    };
    this.editOpen.set(true);
  }

  cancelEdit(): void {
    this.editOpen.set(false);
    this.closeAvatarUpload();
    this.closeBannerUpload();
  }

  saveProfile(): void {
    if (this.saving() || this.uploadingAvatar() || this.uploadingBanner()) return;
    this.saving.set(true);

    const techStack = (this.form.techStackText || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const age = typeof this.form.age === 'number' ? this.form.age : null;

    this.auth.updateProfile(
      {
        name: this.form.name.trim(),
        designation: this.form.designation.trim(),
        organisation: this.form.organisation.trim(),
        address: this.form.address.trim(),
        highestEducation: this.form.highestEducation.trim(),
        experience: this.form.experience,
        age: age ?? undefined,
        gender: this.form.gender,
        dob: this.form.dob,
        linkedinUrl: this.form.linkedinUrl.trim(),
        techStack,
        avatarUrl: this.form.avatarUrl.trim(),
        bannerUrl: this.form.bannerUrl.trim(),
      },
      {
        onSuccess: () => {
          this.saving.set(false);
          this.editOpen.set(false);
        },
        onError: () => {
          this.saving.set(false);
        },
      }
    );
  }

  onAvatarFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;
    this.validateAndUploadAvatar(file, () => {
      if (input) input.value = '';
    });
  }

  removeAvatar(): void {
    if (this.avatarPreviewObjectUrl) URL.revokeObjectURL(this.avatarPreviewObjectUrl);
    this.avatarPreviewObjectUrl = '';
    this.form.avatarUrl = '';
  }

  removeBanner(): void {
    if (this.bannerPreviewObjectUrl) URL.revokeObjectURL(this.bannerPreviewObjectUrl);
    this.bannerPreviewObjectUrl = '';
    this.form.bannerUrl = '';
  }

  handleEscape(): void {
    this.closeAvatarUpload();
    this.closeBannerUpload();
  }

  openAvatarUpload(): void {
    if (this.uploadingAvatar()) return;
    this.avatarDragActive.set(false);
    this.avatarUploadOpen.set(true);
  }

  closeAvatarUpload(): void {
    this.avatarDragActive.set(false);
    this.avatarUploadOpen.set(false);
  }

  openBannerUpload(): void {
    if (this.uploadingBanner()) return;
    this.bannerDragActive.set(false);
    this.bannerUploadOpen.set(true);
  }

  closeBannerUpload(): void {
    this.bannerDragActive.set(false);
    this.bannerUploadOpen.set(false);
  }

  onAvatarDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.avatarUploadOpen() || this.uploadingAvatar()) return;
    this.avatarDragActive.set(true);
  }

  onAvatarDragLeave(event: DragEvent): void {
    event.preventDefault();
    if (!this.avatarUploadOpen()) return;
    this.avatarDragActive.set(false);
  }

  onAvatarDrop(event: DragEvent): void {
    event.preventDefault();
    if (!this.avatarUploadOpen() || this.uploadingAvatar()) return;
    this.avatarDragActive.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.validateAndUploadAvatar(file);
  }

  onBannerDragOver(event: DragEvent): void {
    event.preventDefault();
    if (!this.bannerUploadOpen() || this.uploadingBanner()) return;
    this.bannerDragActive.set(true);
  }

  onBannerDragLeave(event: DragEvent): void {
    event.preventDefault();
    if (!this.bannerUploadOpen()) return;
    this.bannerDragActive.set(false);
  }

  onBannerDrop(event: DragEvent): void {
    event.preventDefault();
    if (!this.bannerUploadOpen() || this.uploadingBanner()) return;
    this.bannerDragActive.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.validateAndUploadBanner(file);
  }

  onBannerFileChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;
    this.validateAndUploadBanner(file, () => {
      if (input) input.value = '';
    });
  }

  private validateAndUploadAvatar(file: File, onFinally?: () => void): void {
    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select an image file');
      onFinally?.();
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.toast.error('Image must be 5MB or smaller');
      onFinally?.();
      return;
    }

    const previous = this.form.avatarUrl;
    if (this.avatarPreviewObjectUrl) URL.revokeObjectURL(this.avatarPreviewObjectUrl);
    this.avatarPreviewObjectUrl = URL.createObjectURL(file);
    this.form.avatarUrl = this.avatarPreviewObjectUrl;

    this.uploadingAvatar.set(true);
    this.auth.uploadAvatar(file).subscribe({
      next: url => {
        const finalUrl = String(url ?? '').trim();
        if (!finalUrl) {
          this.toast.error('Avatar upload failed');
          this.form.avatarUrl = previous;
          return;
        }
        if (this.avatarPreviewObjectUrl) URL.revokeObjectURL(this.avatarPreviewObjectUrl);
        this.avatarPreviewObjectUrl = '';
        this.form.avatarUrl = finalUrl;
        this.auth.updateLocalUser({ avatar: finalUrl });
        this.toast.success('Avatar uploaded');
        this.closeAvatarUpload();
      },
      error: err => {
        if (this.avatarPreviewObjectUrl) URL.revokeObjectURL(this.avatarPreviewObjectUrl);
        this.avatarPreviewObjectUrl = '';
        this.form.avatarUrl = previous;
        const msg = err?.error?.message ?? err?.message;
        this.toast.error(typeof msg === 'string' && msg.trim() ? msg : 'Avatar upload failed');
      },
      complete: () => {
        this.uploadingAvatar.set(false);
        onFinally?.();
      },
    });
  }

  private validateAndUploadBanner(file: File, onFinally?: () => void): void {
    if (!file.type.startsWith('image/')) {
      this.toast.error('Please select an image file');
      onFinally?.();
      return;
    }
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      this.toast.error('Image must be 5MB or smaller');
      onFinally?.();
      return;
    }

    const previous = this.form.bannerUrl;
    if (this.bannerPreviewObjectUrl) URL.revokeObjectURL(this.bannerPreviewObjectUrl);
    this.bannerPreviewObjectUrl = URL.createObjectURL(file);
    this.form.bannerUrl = this.bannerPreviewObjectUrl;

    this.uploadingBanner.set(true);
    this.auth.uploadBanner(file).subscribe({
      next: url => {
        const finalUrl = String(url ?? '').trim();
        if (!finalUrl) {
          this.toast.error('Banner upload failed');
          this.form.bannerUrl = previous;
          return;
        }
        if (this.bannerPreviewObjectUrl) URL.revokeObjectURL(this.bannerPreviewObjectUrl);
        this.bannerPreviewObjectUrl = '';
        this.form.bannerUrl = finalUrl;
        this.auth.updateLocalUser({ bannerUrl: finalUrl });
        this.toast.success('Banner uploaded');
        this.closeBannerUpload();
      },
      error: err => {
        if (this.bannerPreviewObjectUrl) URL.revokeObjectURL(this.bannerPreviewObjectUrl);
        this.bannerPreviewObjectUrl = '';
        this.form.bannerUrl = previous;
        const msg = err?.error?.message ?? err?.message;
        this.toast.error(typeof msg === 'string' && msg.trim() ? msg : 'Banner upload failed');
      },
      complete: () => {
        this.uploadingBanner.set(false);
        onFinally?.();
      },
    });
  }

  toggleAvatarMenu(e: Event): void {
    e.stopPropagation();
    this.avatarMenuOpen.set(!this.avatarMenuOpen());
  }
  toggleBannerMenu(e: Event): void {
    e.stopPropagation();
    this.bannerMenuOpen.set(!this.bannerMenuOpen());
  }
  chooseAvatar(action: 'default' | 'custom' | 'remove'): void {
    if (action === 'default' || action === 'remove') {
      this.form.avatarUrl = '';
      this.avatarMenuOpen.set(false);
    } else if (action === 'custom') {
      this.avatarMenuOpen.set(false);
    }
  }
  chooseBanner(action: 'default' | 'custom' | 'remove'): void {
    if (action === 'default' || action === 'remove') {
      this.form.bannerUrl = '';
      this.bannerMenuOpen.set(false);
    } else if (action === 'custom') {
      this.bannerMenuOpen.set(false);
    }
  }
}
