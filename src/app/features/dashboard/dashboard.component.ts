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
import { Comment } from '../../core/models';

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
