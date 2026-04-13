import { Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { QuestionService } from '../../core/services/question.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.css'],
})
export class FeedComponent {
  qs = inject(QuestionService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  active = 'Top rated';

  hotThisWeek(): Array<{ tag: string; today: number; week: number }> {
    const questions = this.qs.questions();
    if (!questions.length) return [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 6);

    const week = new Map<string, number>();
    const today = new Map<string, number>();

    for (const q of questions) {
      const createdAt = q.createdAt instanceof Date ? q.createdAt : new Date(q.createdAt as any);
      if (Number.isNaN(createdAt.getTime()) || createdAt < weekStart) continue;

      const tags = [q.techTag, ...(q.hashtags ?? [])]
        .map(t => String(t ?? '').trim())
        .filter(Boolean)
        .map(t => (t.startsWith('#') ? t.slice(1) : t))
        .map(t => t.trim())
        .filter(Boolean);

      for (const t of tags) {
        const key = t.toLowerCase();
        week.set(key, (week.get(key) ?? 0) + 1);
        if (createdAt >= todayStart) today.set(key, (today.get(key) ?? 0) + 1);
      }
    }

    const top = Array.from(week.entries())
      .map(([key, weekCount]) => ({ key, week: weekCount, today: today.get(key) ?? 0 }))
      .sort((a, b) => b.week - a.week)
      .slice(0, 3);

    return top.map(x => ({ tag: `#${x.key}`, today: x.today, week: x.week }));
  }
}
