import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Job } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { ToastService } from '../../core/services/toast.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';

@Component({
  selector: 'app-job-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    SidebarComponent,
    BottomNavComponent,
    DrawerComponent,
    PostModalComponent,
  ],
  templateUrl: './job-detail.component.html',
  styleUrls: ['./job-detail.component.css'],
})
export class JobDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  jobs = inject(JobService);
  auth = inject(AuthService);
  toast = inject(ToastService);

  id = this.route.snapshot.paramMap.get('id') ?? '';
  drawerOpen = signal(false);
  postOpen = signal(false);
  loading = signal(true);
  confirmDeleteOpen = signal(false);
  deleting = signal(false);
  poster = signal<Job['postedBy'] | null>(null);

  job = computed<Job | null>(() => (this.id ? this.jobs.getById(this.id) : null));
  posterInfo = computed(() => {
    const job = this.job();
    if (!job) return null;
    return { ...(job.postedBy ?? {}), ...(this.poster() ?? {}) };
  });
  isSaved = computed(() => (this.id ? this.jobs.isJobSaved(this.id) : false));
  canDelete = computed(() => {
    const currentId = this.auth.currentUser()?.id;
    const posterId = this.job()?.postedBy?.id;
    return !!currentId && !!posterId && String(currentId) === String(posterId);
  });

  constructor() {
    this.jobs.markJobsSeen();
    effect(
      () => {
        const items = this.jobs.jobs();
        if (!items.length) return;
        this.jobs.markJobsSeenToLatest();
      },
      { allowSignalWrites: true }
    );

    if (!this.id) {
      this.loading.set(false);
      return;
    }

    this.jobs.fetchById(this.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.loadPoster();
      },
      error: () => this.loading.set(false),
    });

    this.loadPoster();
  }

  back(): void {
    this.router.navigate(['/jobs']);
  }

  deleteJob(): void {
    const job = this.job();
    if (!job?.id) return;
    if (!this.canDelete()) {
      this.toast.error('You can only delete your own job listings');
      return;
    }
    this.confirmDeleteOpen.set(true);
  }

  closeDeleteModal(): void {
    if (this.deleting()) return;
    this.confirmDeleteOpen.set(false);
  }

  confirmDeleteJob(): void {
    const job = this.job();
    if (!job?.id) return;
    if (!this.canDelete()) return;
    if (this.deleting()) return;

    this.deleting.set(true);
    this.jobs.delete(job.id, {
      onSuccess: () => {
        this.deleting.set(false);
        this.confirmDeleteOpen.set(false);
        this.toast.success('Job deleted');
        this.back();
      },
      onError: () => {
        this.deleting.set(false);
        this.toast.error('Failed to delete job');
      },
    });
  }

  apply(job: Job): void {
    const url = String(job.applyUrl ?? '').trim();
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  }

  toggleSave(): void {
    if (!this.id) return;
    this.jobs.toggleJobSaved(this.id);
  }

  jobSource(job: Job): string {
    const explicit = String(job.source ?? '').trim();
    if (explicit) return explicit;

    const url = String(job.applyUrl ?? '').trim().toLowerCase();
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('naukri.com')) return 'Naukri';
    return 'Community';
  }

  private loadPoster(): void {
    const job = this.job();
    const posterId = job?.postedBy?.id ? String(job.postedBy.id) : '';
    if (!posterId) return;
    if (this.poster()?.id && String(this.poster()!.id) === posterId) return;
    this.auth.fetchUserById(posterId).subscribe({
      next: user => {
        this.poster.set(user);
      },
    });
  }
}
