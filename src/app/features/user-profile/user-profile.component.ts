import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { QuestionService } from '../../core/services/question.service';
import { Question, User } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

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
  drawerOpen = signal(false);
  postOpen = signal(false);
  userId = this.route.snapshot.paramMap.get('id') ?? '';
  questions = signal<Question[]>([]);
  user = signal<User | null>(null);
  constructor() {
    const id = this.userId;
    const list = this.qs.getByAuthor(id);
    this.questions.set(list);
    if (id) {
      this.auth.fetchUserById(id).subscribe({
        next: u => this.user.set(u),
      });
    }
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
