import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { QuestionService } from '../../core/services/question.service';
import { User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent {
  route = inject(ActivatedRoute);
  qs = inject(QuestionService);
  auth = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);
  drawerOpen = signal(false);
  postOpen = signal(false);
  userId = signal<string>('');
  user = signal<User | null>(null);
  loadingUser = signal(false);
  userError = signal('');
  questions = computed(() => this.qs.getByAuthor(this.userId()));
  
  userFollowing = signal<User[]>([]);
  userFollowers = signal<User[]>([]);
  activeTab = signal<'Questions' | 'Following' | 'Followers'>('Questions');

  isFollowing = computed(() => {
    return this.userService.myFollowing().some(u => String(u.id) === String(this.userId()));
  });

  constructor() {
    this.userService.loadMyFollowing();
    this.route.paramMap.subscribe(pm => {
      const id = pm.get('id') ?? '';
      this.userId.set(id);
      this.activeTab.set('Questions');
      this.loadUser(id);
      this.loadFollows(id);
    });
  }

  loadFollows(id?: string) {
    const userId = String(id ?? this.userId()).trim();
    if (!userId) return;
    this.userService.getUserFollowing(userId).subscribe(users => this.userFollowing.set(users));
    this.userService.getUserFollowers(userId).subscribe(users => this.userFollowers.set(users));
  }

  private loadUser(id: string): void {
    const userId = String(id ?? '').trim();
    if (!userId) {
      this.user.set(null);
      this.userError.set('User not found');
      this.loadingUser.set(false);
      return;
    }

    this.loadingUser.set(true);
    this.auth.fetchUserById(userId).subscribe({
      next: u => {
        this.user.set(u);
        this.userError.set('');
        this.loadingUser.set(false);
      },
      error: () => {
        this.user.set(null);
        this.userError.set('User not found');
        this.loadingUser.set(false);
      },
    });
  }

  toggleFollow() {
    if (!this.auth.isLoggedIn()) {
      // should redirect or show toast
      return;
    }
    const id = this.userId();
    if (!id) return;
    if (this.isFollowing()) {
      this.userService.unfollowUser(id).subscribe(() => {
        this.loadFollows(id);
      });
    } else {
      this.userService.followUser(id).subscribe(() => {
        this.loadFollows(id);
      });
    }
  }

  goToUser(id: string): void {
    if (!id) return;
    this.router.navigate(['/user', id]);
  }

  get userName(): string {
    return this.user()?.name ?? this.questions()[0]?.author.name ?? 'User';
  }
  get totalVotes(): number {
    const apiVotes = this.user()?.totalVotes ?? 0;
    if (apiVotes) return apiVotes;
    return this.questions().reduce((s, q) => s + (q.votes ?? 0), 0);
  }

  get questionsCount(): number {
    return this.user()?.questionsPosted ?? this.questions().length;
  }

  joinedLabel(): string {
    const joinedAt = this.user()?.joinedAt;
    if (!joinedAt) return '';
    const d = joinedAt instanceof Date ? joinedAt : new Date(joinedAt as any);
    return `Joined ${d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
  }
}
