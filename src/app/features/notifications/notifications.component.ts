import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { ScrollFabComponent } from '../../shared/components/scroll-fab.component';
import { AuthService } from '../../core/services/auth.service';
import { QuestionService } from '../../core/services/question.service';
import { RouterLink } from '@angular/router';
import { Comment, Question } from '../../core/models';

type NotifEvent = {
  id: string;
  kind: 'comment' | 'reply' | 'system';
  icon: string;
  title: string;
  text: string;
  createdAt: Date;
  from?: { id?: string; name?: string };
  question?: { id: string; title: string };
};

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, ScrollFabComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  auth = inject(AuthService);
  qs = inject(QuestionService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  private lastSeen = signal<number>(0);
  private lastSeenStorageKey = computed(() => {
    const userId = this.auth.currentUser()?.id ? String(this.auth.currentUser()!.id) : 'guest';
    return `lmp_notif_last_seen_${userId}`;
  });

  constructor() {
    effect(
      () => {
        const key = this.lastSeenStorageKey();
        this.lastSeen.set(this.loadLastSeen(key));
      },
      { allowSignalWrites: true }
    );

    effect(
      () => {
        const items = this.notifications();
        if (!items.length) return;
        this.markSeenToLatest();
      },
      { allowSignalWrites: true }
    );
  }

  notifications = computed<NotifEvent[]>(() => {
    const userId = this.auth.currentUser()?.id ? String(this.auth.currentUser()!.id) : '';
    if (!userId) return [];

    const out: NotifEvent[] = [];
    const authored = this.qs.getByAuthor(userId);
    for (const q of authored) {
      const thread = q.thread ?? [];
      this.collectThreadNotifs(out, q, thread, userId);
    }

    const joinedAt = this.auth.currentUser()?.joinedAt;
    if (joinedAt) {
      const d = joinedAt instanceof Date ? joinedAt : new Date(joinedAt as any);
      if (!Number.isNaN(d.getTime())) {
        out.push({
          id: `sys-welcome-${userId}`,
          kind: 'system',
          icon: 'celebration',
          title: 'Welcome to LastMinPrep',
          text: 'Start by posting a question, commenting on others, and saving the best ones for later.',
          createdAt: d,
        });
      }
    }

    out.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return out;
  });

  unreadCount = computed(() => {
    const last = this.lastSeen();
    if (!last) return this.notifications().length;
    let c = 0;
    for (const n of this.notifications()) {
      if (n.createdAt.getTime() > last) c += 1;
    }
    return c;
  });

  isUnread(n: NotifEvent): boolean {
    const t = n.createdAt?.getTime?.() ?? 0;
    const last = this.lastSeen();
    if (!last) return true;
    return t > last;
  }

  markSeen(at?: number): void {
    const now = typeof at === 'number' && Number.isFinite(at) ? Math.max(0, Math.floor(at)) : Date.now();
    const key = this.lastSeenStorageKey();
    try {
      localStorage.setItem(key, String(now));
    } catch { }
    this.lastSeen.set(now);
  }

  markSeenToLatest(): void {
    const latest = this.notifications().reduce((max, n) => Math.max(max, n.createdAt.getTime()), 0);
    this.markSeen(latest || Date.now());
  }

  private collectThreadNotifs(out: NotifEvent[], q: Question, thread: Comment[], currentUserId: string, parent?: Comment): void {
    for (const c of thread) {
      const authorId = c?.author?.id ? String(c.author.id) : '';
      const authorName = c?.author?.name ? String(c.author.name) : 'Someone';
      const createdAt = c?.createdAt instanceof Date ? c.createdAt : new Date(c?.createdAt as any);
      const okDate = createdAt && !Number.isNaN(createdAt.getTime());

      const parentAuthorId = parent?.author?.id ? String(parent.author.id) : '';

      if (okDate && authorId && authorId !== currentUserId) {
        if (!parent) {
          out.push({
            id: `c-${q.id}-${c.id}`,
            kind: 'comment',
            icon: 'chat_bubble',
            title: `${authorName} commented on your question`,
            text: q.title,
            createdAt,
            from: { id: authorId, name: authorName },
            question: { id: String(q.id), title: q.title },
          });
        } else if (parentAuthorId && parentAuthorId === currentUserId) {
          out.push({
            id: `r-${q.id}-${c.id}`,
            kind: 'reply',
            icon: 'reply',
            title: `${authorName} replied to your comment`,
            text: q.title,
            createdAt,
            from: { id: authorId, name: authorName },
            question: { id: String(q.id), title: q.title },
          });
        }
      }

      if (c?.replies?.length) this.collectThreadNotifs(out, q, c.replies, currentUserId, c);
    }
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
