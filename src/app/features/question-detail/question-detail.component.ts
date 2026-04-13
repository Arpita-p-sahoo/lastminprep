import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Question } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { QuestionService } from '../../core/services/question.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';

@Component({
  selector: 'app-question-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    SidebarComponent,
    BottomNavComponent,
    DrawerComponent,
    PostModalComponent,
  ],
  templateUrl: './question-detail.component.html',
  styleUrls: ['./question-detail.component.css'],
})
export class QuestionDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  qs = inject(QuestionService);
  auth = inject(AuthService);

  id = this.route.snapshot.paramMap.get('id') ?? '';
  drawerOpen = signal(false);
  postOpen = signal(false);

  loading = signal(true);
  question = computed<Question | null>(() => (this.id ? this.qs.getById(this.id) : null));
  newComment = '';

  constructor() {
    if (!this.id) {
      this.loading.set(false);
      return;
    }

    this.qs.fetchById(this.id).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  back(): void {
    this.router.navigate(['/feed']);
  }

  get canDelete(): boolean {
    const currentId = this.auth.currentUser()?.id;
    const authorId = this.question()?.author.id;
    return !!currentId && !!authorId && String(currentId) === String(authorId);
  }

  deleteQuestion(): void {
    const id = this.question()?.id;
    if (!id) return;
    this.qs.delete(id, {
      onSuccess: () => this.router.navigate(['/feed']),
    });
  }

  addComment(): void {
    const t = this.newComment.trim();
    const id = this.question()?.id;
    if (!t || !id) return;
    this.qs.comment(id, t);
    this.newComment = '';
  }
}
