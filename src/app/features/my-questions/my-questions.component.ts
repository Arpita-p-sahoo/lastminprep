import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionService } from '../../core/services/question.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Question } from '../../core/models';

@Component({
  selector: 'app-my-questions',
  standalone: true,
  imports: [RouterLink, NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
  templateUrl: './my-questions.component.html',
  styleUrls: ['./my-questions.component.css'],
})
export class MyQuestionsComponent {
  qs = inject(QuestionService);
  auth = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  confirmDeleteOpen = signal(false);
  deleting = signal(false);
  deleteId = signal('');
  myQ = () => {
    const userId = this.auth.currentUser()?.id ?? '';
    return this.qs.getByAuthor(userId);
  };
  totalVotes = () => this.myQ().reduce((s, q) => s + q.votes, 0);

  openComments(q: Question): void {
    this.router.navigate(['/questions', q.id], { fragment: 'comments' });
  }

  editQuestion(q: Question): void {
    this.router.navigate(['/questions', q.id], { queryParams: { edit: '1' } });
  }

  requestDelete(q: Question): void {
    if (!q?.id) return;
    this.deleteId.set(String(q.id));
    this.confirmDeleteOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.deleting()) return;
    this.confirmDeleteOpen.set(false);
  }

  confirmDelete(): void {
    const id = this.deleteId();
    if (!id) return;
    if (this.deleting()) return;
    this.deleting.set(true);
    this.qs.delete(id, {
      onSuccess: () => {
        this.deleting.set(false);
        this.confirmDeleteOpen.set(false);
        this.toast.success('Question deleted');
      },
      onError: () => {
        this.deleting.set(false);
        this.toast.error('Failed to delete question');
      },
    });
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
}
