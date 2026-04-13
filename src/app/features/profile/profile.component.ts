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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent {
  auth = inject(AuthService);
  qs = inject(QuestionService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  editOpen = signal(false);
  saving = signal(false);
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
  }

  saveProfile(): void {
    if (this.saving()) return;
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
