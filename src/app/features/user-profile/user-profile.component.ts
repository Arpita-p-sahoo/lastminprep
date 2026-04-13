import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { QuestionService } from '../../core/services/question.service';
import { Question } from '../../core/models';

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
  drawerOpen = signal(false);
  postOpen = signal(false);
  userId = this.route.snapshot.paramMap.get('id') ?? '';
  questions = signal<Question[]>([]);
  constructor() {
    const id = this.userId;
    const list = this.qs.getByAuthor(id);
    this.questions.set(list);
  }
  get userName(): string {
    const q = this.questions()[0];
    return q?.author.name ?? 'User';
  }
  get totalVotes(): number {
    return this.questions().reduce((s, q) => s + (q.votes ?? 0), 0);
  }
}
