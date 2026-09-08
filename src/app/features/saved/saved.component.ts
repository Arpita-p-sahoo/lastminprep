import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { ScrollFabComponent } from '../../shared/components/scroll-fab.component';
import { QuestionService } from '../../core/services/question.service';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../core/models';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent, ScrollFabComponent],
  templateUrl: './saved.component.html',
  styles: [
    `
    .saved-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:1rem;}
    .saved-job-card{padding:1rem;margin-bottom:10px;cursor:pointer;}
    .saved-job-top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;}
    .saved-job-main{min-width:0;flex:1;}
    .saved-job-title{font-size:15px;font-weight:800;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .saved-job-meta{font-size:13px;color:var(--ink2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
    .saved-job-tags{display:flex;gap:6px;align-items:center;flex-shrink:0;}
    .saved-job-desc{font-size:13px;color:var(--ink2);line-height:1.6;margin-top:10px;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere;}
    .saved-job-foot{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:10px;}
    .saved-job-actions{display:flex;gap:8px;align-items:center;}
    .saved-job-save{border:1px solid var(--border);background:var(--bg2);color:var(--accent);padding:4px 6px;border-radius:999px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;}
    `
  ],
})
export class SavedComponent {
  qs = inject(QuestionService);
  jobs = inject(JobService);
  router = inject(Router);
  d = signal(false); p = signal(false);
  tab = signal<'questions' | 'jobs'>('questions');
  savedQuestions = () => this.qs.getSaved();
  savedJobs = () => this.jobs.savedJobs();

  constructor() {
    this.qs.loadSaved();
    this.jobs.loadSaved();
  }

  openJob(job: Job): void {
    this.router.navigate(['/jobs', job.id]);
  }
}
