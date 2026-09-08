import { Component, DestroyRef, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { ScrollFabComponent } from '../../shared/components/scroll-fab.component';
import { AuthService } from '../../core/services/auth.service';
import { QuestionService } from '../../core/services/question.service';
import { RouterLink } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { Comment, Question } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent, ScrollFabComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  auth = inject(AuthService);
  qs = inject(QuestionService);
  jobs = inject(JobService);
  destroyRef = inject(DestroyRef);
  drawerOpen = signal(false);
  postOpen = signal(false);
  now = signal(Date.now());
  activeChip = 'All';
  chips = ['All', 'Angular', 'Node.js', 'React', 'System Design', 'DevOps'];

  constructor() {
    const intervalId = window.setInterval(() => this.now.set(Date.now()), 60_000);
    this.destroyRef.onDestroy(() => window.clearInterval(intervalId));
  }
  get latestJobs() {
    return this.jobs.jobs().slice(0, 3).map(j => ({ title: j.title, company: j.company, loc: j.location, stack: j.techStack }));
  }

  filteredQuestions(): Question[] {
    const chip = this.activeChip;
    if (chip === 'All') return this.qs.questions();
    const skill = chip.toLowerCase();
    return this.qs.questions().filter(q => {
      const tag = String(q.techTag ?? '').toLowerCase();
      const hashes = (q.hashtags ?? []).map(h => String(h).toLowerCase());
      return tag === skill || tag.includes(skill) || hashes.some(h => h === skill || h.includes(skill));
    });
  }

  trending(): { name: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const q of this.qs.questions()) {
      const tags = [q.techTag, ...(q.hashtags ?? [])].map(t => String(t ?? '').trim()).filter(Boolean);
      for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }

  selectTopic(name: string): void {
    this.activeChip = name;
  }

  get postedCount(): number {
    const user = this.auth.currentUser();
    if (!user) return 0;
    const userCount = user.questionsPosted ?? 0;
    const listCount = user.id ? this.qs.getByAuthor(user.id).length : 0;
    return Math.max(userCount, listCount);
  }

  get answeredCount(): number {
    const user = this.auth.currentUser();
    if (!user?.id) return 0;

    const authored = this.qs.getByAuthor(user.id);
    const received = authored.reduce((sum, q) => {
      if (q.thread?.length) return sum + this.countNonAuthorComments(q.thread, user.id);
      return sum + (q.commentCount ?? 0);
    }, 0);

    return Math.max(user.answeredCount ?? 0, received);
  }

  get dayStreak(): number {
    return this.auth.currentUser()?.streak ?? 0;
  }

  get firstName(): string {
    const name = this.auth.currentUser()?.name;
    return name?.split(' ')[0] ?? '';
  }

  get greeting(): string {
    this.now();
    const h = new Date().getHours();
    if (h >= 5 && h < 12) return 'Good morning';
    if (h >= 12 && h < 17) return 'Good afternoon';
    if (h >= 17 && h < 22) return 'Good evening';
    return 'Good night';
  }

  private countNonAuthorComments(thread: Comment[], authorId: string): number {
    let count = 0;
    for (const c of thread) {
      const isFromOther = c?.author?.id && String(c.author.id) !== String(authorId);
      if (isFromOther) count += 1;
      if (c.replies?.length) count += this.countNonAuthorComments(c.replies, authorId);
    }
    return count;
  }

}
