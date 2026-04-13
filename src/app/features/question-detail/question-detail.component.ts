import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Comment, Question } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { QuestionService } from '../../core/services/question.service';
import { ToastService } from '../../core/services/toast.service';
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
  toast = inject(ToastService);

  id = this.route.snapshot.paramMap.get('id') ?? '';
  drawerOpen = signal(false);
  postOpen = signal(false);

  loading = signal(true);
  question = computed<Question | null>(() => (this.id ? this.qs.getById(this.id) : null));
  newComment = '';

  editOpen = signal(false);
  editTitle = signal('');
  editTechTag = signal('General');
  editHashtags = signal('');
  savingEdit = signal(false);

  deleteTarget = signal<{ kind: 'question' | 'comment'; id: string } | null>(null);
  deleting = signal(false);

  private readonly startInEdit = this.route.snapshot.queryParamMap.get('edit') === '1';
  private readonly startFragment = this.route.snapshot.fragment ?? '';

  constructor() {
    if (!this.id) {
      this.loading.set(false);
      return;
    }

    this.qs.fetchById(this.id).subscribe({
      next: () => {
        this.loading.set(false);
        if (this.startInEdit) this.startEdit();
        if (this.startFragment === 'comments') {
          window.setTimeout(() => this.scrollToComments(), 50);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });

    effect(() => {
      const q = this.question();
      if (!q) return;
      if (!this.startInEdit) return;
      if (!this.editOpen() && this.canDelete) this.startEdit();
    });
  }

  back(): void {
    this.router.navigate(['/feed']);
  }

  displayText(raw: unknown): string {
    const t = String(raw ?? '');
    const m = t.match(/^\s*```[a-z0-9+-]*\s*\n([\s\S]*?)\n\s*```\s*$/i);
    return m ? m[1] : t;
  }

  isCodeText(raw: unknown): boolean {
    const t = this.displayText(raw);
    const trimmed = t.trim();
    if (!trimmed) return false;

    if (trimmed.includes('```')) return true;

    const hasNewline = /[\r\n]/.test(trimmed);
    const braces = (trimmed.match(/[{}]/g)?.length ?? 0);
    const semicolons = (trimmed.match(/;/g)?.length ?? 0);
    const keywords = /\b(class|public|private|protected|static|void|int|String|System\.out|console\.log|def|function|const|let|var|import|package)\b/.test(
      trimmed
    );

    if (hasNewline && (braces >= 2 || semicolons >= 2)) return true;
    if (braces >= 2 && semicolons >= 1 && keywords) return true;
    if (hasNewline && (/^\s{2,}/m.test(trimmed) || /\t/.test(trimmed))) return true;
    return false;
  }

  get canDelete(): boolean {
    const currentId = this.auth.currentUser()?.id;
    const authorId = this.question()?.author.id;
    return !!currentId && !!authorId && String(currentId) === String(authorId);
  }

  canDeleteComment(c: Comment): boolean {
    const currentId = this.auth.currentUser()?.id;
    const authorId = c?.author?.id;
    return !!currentId && !!authorId && String(currentId) === String(authorId);
  }

  deleteQuestion(): void {
    const id = this.question()?.id;
    if (!id) return;
    if (!this.canDelete) return;
    this.deleteTarget.set({ kind: 'question', id });
  }

  deleteComment(commentId: string): void {
    const questionId = this.question()?.id;
    if (!questionId || !commentId) return;
    this.deleteTarget.set({ kind: 'comment', id: commentId });
  }

  addComment(): void {
    const t = this.newComment.trim();
    const id = this.question()?.id;
    if (!t || !id) return;
    this.qs.comment(id, t);
    this.newComment = '';
  }

  scrollToComments(): void {
    const el = document.getElementById('comments');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      const input = document.getElementById('comment-input') as HTMLInputElement | null;
      input?.focus();
    }, 250);
  }

  startEdit(): void {
    const q = this.question();
    if (!q) return;
    if (!this.canDelete) return;
    this.editTitle.set(q.title ?? '');
    this.editTechTag.set(String(q.techTag ?? 'General') || 'General');
    this.editHashtags.set((q.hashtags ?? []).join(', '));
    this.editOpen.set(true);
  }

  cancelEdit(): void {
    if (this.savingEdit()) return;
    this.editOpen.set(false);
  }

  saveEdit(): void {
    const q = this.question();
    if (!q?.id) return;
    if (!this.canDelete) return;
    if (this.savingEdit()) return;

    const title = this.editTitle().trim();
    const techTag = this.editTechTag().trim() || 'General';
    const hashtags = this.editHashtags()
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (!title) return;

    this.savingEdit.set(true);
    this.qs.update(
      q.id,
      { title, techTag, hashtags },
      {
        onSuccess: () => {
          this.savingEdit.set(false);
          this.editOpen.set(false);
          this.toast.success('Question updated');
          this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
        },
        onError: () => {
          this.savingEdit.set(false);
          this.toast.error('Failed to update question');
        },
      }
    );
  }

  closeDeleteModal(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    const q = this.question();
    if (!target || !q?.id) return;
    if (this.deleting()) return;

    this.deleting.set(true);
    if (target.kind === 'question') {
      this.qs.delete(q.id, {
        onSuccess: () => {
          this.deleting.set(false);
          this.deleteTarget.set(null);
          this.toast.success('Question deleted');
          this.router.navigate(['/feed']);
        },
        onError: () => {
          this.deleting.set(false);
          this.toast.error('Failed to delete question');
        },
      });
      return;
    }

    this.qs.deleteComment(q.id, target.id, {
      onSuccess: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Comment deleted');
      },
      onError: () => {
        this.deleting.set(false);
        this.toast.error('Failed to delete comment');
      },
    });
  }
}
