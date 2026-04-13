import { Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { AuthService } from '../../core/services/auth.service';
import { QuestionService } from '../../core/services/question.service';
import { RouterLink } from '@angular/router';
import { JobService } from '../../core/services/job.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  auth = inject(AuthService);
  qs = inject(QuestionService);
  jobs = inject(JobService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  activeChip = 'All';
  chips = ['All', 'Angular', 'Node.js', 'React', 'System Design', 'DevOps'];
  trending: { name: string; count: number }[] = [];
  get latestJobs() {
    return this.jobs.jobs().slice(0, 3).map(j => ({ title: j.title, company: j.company, loc: j.location, stack: j.techStack }));
  }

  get postedCount(): number {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return 0;
    return this.qs.getByAuthor(userId).length;
  }

  get answeredCount(): number {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return 0;
    return this.qs.questions().reduce((sum, q) => sum + this.countCommentsByUser(q.thread, userId), 0);
  }

  get dayStreak(): number {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return 0;
    const activeDays = this.collectActiveDays(userId);
    if (!activeDays.size) return this.auth.currentUser()?.streak ?? 0;

    const day = new Date();
    day.setHours(0, 0, 0, 0);
    if (!activeDays.has(this.dateKey(day))) day.setDate(day.getDate() - 1);

    let streak = 0;
    while (activeDays.has(this.dateKey(day))) {
      streak += 1;
      day.setDate(day.getDate() - 1);
    }
    return Math.max(streak, this.auth.currentUser()?.streak ?? 0);
  }

  get firstName(): string {
    const name = this.auth.currentUser()?.name;
    return name?.split(' ')[0] ?? '';
  }

  private countCommentsByUser(comments: any, userId: string): number {
    if (!Array.isArray(comments) || !userId) return 0;
    let count = 0;
    for (const c of comments) {
      const authorId = c?.author?.id ?? c?.authorId ?? c?.userId;
      if (authorId != null && String(authorId) === String(userId)) count += 1;
      count += this.countCommentsByUser(c?.replies, userId);
    }
    return count;
  }

  private collectActiveDays(userId: string): Set<string> {
    const days = new Set<string>();
    for (const q of this.qs.questions()) {
      const authorId = q?.author?.id;
      if (authorId != null && String(authorId) === String(userId)) {
        const d = this.toDate(q.createdAt);
        if (d) days.add(this.dateKey(d));
      }
      this.collectCommentDays(q?.thread, userId, days);
    }
    return days;
  }

  private collectCommentDays(comments: any, userId: string, days: Set<string>): void {
    if (!Array.isArray(comments) || !userId) return;
    for (const c of comments) {
      const authorId = c?.author?.id ?? c?.authorId ?? c?.userId;
      if (authorId != null && String(authorId) === String(userId)) {
        const d = this.toDate(c?.createdAt);
        if (d) days.add(this.dateKey(d));
      }
      this.collectCommentDays(c?.replies, userId, days);
    }
  }

  private toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  private dateKey(d: Date): string {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    const y = day.getFullYear();
    const m = String(day.getMonth() + 1).padStart(2, '0');
    const dd = String(day.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  }
}
