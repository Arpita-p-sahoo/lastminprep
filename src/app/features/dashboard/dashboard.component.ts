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

  get firstName(): string {
    const name = this.auth.currentUser()?.name;
    return name?.split(' ')[0] ?? '';
  }
}
