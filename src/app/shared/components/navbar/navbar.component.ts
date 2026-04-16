import { Component, ElementRef, ViewChild, computed, effect, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuestionService } from '../../../core/services/question.service';
import { Comment, Question } from '../../../core/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  host: { '(document:click)': 'handleDocClick($event)' },
})
export class NavbarComponent {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  qs = inject(QuestionService);
  router = inject(Router);
  drawerOpen = output<void>();
  menuOpen = signal(false);
  @ViewChild('profileWrap') profileWrap?: ElementRef<HTMLElement>;

  private notifLastSeen = signal<number>(0);
  private notifStorageKey = computed(() => {
    const userId = this.auth.currentUser()?.id ? String(this.auth.currentUser()!.id) : 'guest';
    return `lmp_notif_last_seen_${userId}`;
  });

  constructor() {
    effect(
      () => {
        const key = this.notifStorageKey();
        this.notifLastSeen.set(this.loadLastSeen(key));
      },
      { allowSignalWrites: true }
    );
  }

  hasUnread = computed(() => {
    const last = this.notifLastSeen();
    const userId = this.auth.currentUser()?.id ? String(this.auth.currentUser()!.id) : '';
    if (!userId) return false;
    const authored = this.qs.getByAuthor(userId);
    for (const q of authored) {
      if (this.threadHasUnread(q, q.thread ?? [], userId, last)) return true;
    }
    return false;
  });

  clearNotifications(): void {
    const now = Date.now();
    const key = this.notifStorageKey();
    try {
      localStorage.setItem(key, String(now));
    } catch { }
    this.notifLastSeen.set(now);
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.menuOpen.set(!this.menuOpen());
  }

  handleDocClick(event: Event): void {
    if (!this.menuOpen()) return;
    const wrap = this.profileWrap?.nativeElement;
    const target = event.target as Node | null;
    if (wrap && target && wrap.contains(target)) return;
    this.menuOpen.set(false);
  }

  toggleTheme(event: Event): void {
    event.stopPropagation();
    this.theme.toggle();
  }

  goSettings(): void {
    this.menuOpen.set(false);
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
  }

  private threadHasUnread(q: Question, thread: Comment[], currentUserId: string, lastSeen: number, parent?: Comment): boolean {
    for (const c of thread) {
      const authorId = c?.author?.id ? String(c.author.id) : '';
      const createdAt = c?.createdAt instanceof Date ? c.createdAt : new Date(c?.createdAt as any);
      const t = createdAt?.getTime?.() ?? 0;
      const isOther = authorId && authorId !== currentUserId;
      const parentAuthorId = parent?.author?.id ? String(parent.author.id) : '';
      const isDirectOnMyQuestion = !parent && isOther;
      const isReplyToMyComment = !!parent && parentAuthorId === currentUserId && isOther;
      if ((isDirectOnMyQuestion || isReplyToMyComment) && t > lastSeen) return true;
      if (c?.replies?.length && this.threadHasUnread(q, c.replies, currentUserId, lastSeen, c)) return true;
    }
    return false;
  }

  private loadLastSeen(key: string): number {
    try {
      const raw = localStorage.getItem(key);
      const n = Number(raw ?? 0);
      return Number.isFinite(n) && n > 0 ? n : 0;
    } catch {
      return 0;
    }
  }
}
