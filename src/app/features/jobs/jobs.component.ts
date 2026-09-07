import { Component, ElementRef, ViewChild, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { Job } from '../../core/models';
import { TECH_DOMAINS } from '../../core/data/tech-domains';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, FormsModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
  host: { '(document:click)': 'handleDocClick($event)' },
})
export class JobsComponent {
  jobService = inject(JobService);
  auth = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  drawerOpen = signal(false);
  postOpen = signal(false);
  jobModalOpen = signal(false);
  filterPanelOpen = signal(false);
  @ViewChild('filterWrap') filterWrap?: ElementRef<HTMLElement>;
  searchQuery = signal('');
  activeFilter = signal('All');
  sourceFilter = signal<'All' | 'LinkedIn' | 'Naukri' | 'Community'>('All');
  typeFilter = signal<'All' | Job['type']>('All');
  experienceFilter = signal<string>('All');
  skillFilter = signal<string | null>(null);

  sourceOptions: Array<'All' | 'LinkedIn' | 'Naukri' | 'Community'> = ['All', 'LinkedIn', 'Naukri', 'Community'];
  typeOptions: Array<'All' | Job['type']> = ['All', 'Remote', 'Hybrid', 'Onsite'];
  quickFilters = ['All', 'Following', 'Remote', 'Full-stack', 'Fresher'];

  /** Popular skills from the same domain/framework catalog used on the Explore page. */
  skillOptions: string[] = Array.from(new Set(TECH_DOMAINS.flatMap(d => d.frameworks)
    .sort((a, b) => b.count - a.count)
    .map(fw => fw.name)))
    .slice(0, 12);

  jobForm = {
    title: '',
    company: '',
    location: '',
    type: 'Remote' as const,
    experience: '2-5 yrs',
    techStack: '',
    salary: '',
    description: '',
    source: 'Community',
    applyUrl: '',
  };

  experienceOptions = computed(() => {
    const values = new Set<string>();
    for (const job of this.jobService.jobs()) {
      const v = String(job.experience ?? '').trim();
      if (v) values.add(v);
    }
    return ['All', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  });

  filteredJobs = computed(() => {
    const quick = this.activeFilter();
    const jobs = quick === 'Following' ? this.jobService.followingJobs() : this.jobService.jobs();
    const q = this.searchQuery().trim().toLowerCase();
    const source = this.sourceFilter();
    const type = this.typeFilter();
    const exp = this.experienceFilter();
    const skill = this.skillFilter()?.trim().toLowerCase() || null;

    const filtered = jobs.filter(job => {
      if (source !== 'All' && this.jobSource(job) !== source) return false;
      if (quick !== 'All' && quick !== 'Following' && !this.matchesQuickFilter(job, quick)) return false;
      if (type !== 'All' && job.type !== type) return false;
      if (exp !== 'All' && String(job.experience ?? '').trim() !== exp) return false;
      if (skill && !this.matchesSearch(job, skill)) return false;
      if (q && !this.matchesSearch(job, q)) return false;
      return true;
    });

    return filtered.slice().sort((a, b) => {
      const at = a.postedAt instanceof Date ? a.postedAt.getTime() : new Date(a.postedAt as any).getTime();
      const bt = b.postedAt instanceof Date ? b.postedAt.getTime() : new Date(b.postedAt as any).getTime();
      return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
    });
  });

  constructor() {
    this.skillFilter.set(this.route.snapshot.queryParamMap.get('tech'));
    this.jobService.loadFollowingFeed();
    this.jobService.markJobsSeen();
    effect(
      () => {
        const items = this.jobService.jobs();
        if (!items.length) return;
        this.jobService.markJobsSeenToLatest();
      },
      { allowSignalWrites: true }
    );
  }

  postJob(): void {
    const user = this.auth.currentUser();
    this.jobService.post({
      ...this.jobForm,
      techStack: this.jobForm.techStack.split(',').map(s => s.trim()).filter(Boolean),
      postedBy: user ? { id: user.id, name: user.name, email: user.email, linkedinUrl: user.linkedinUrl } : {},
      postedAt: new Date(),
    });
    this.jobModalOpen.set(false);
  }

  openJob(job: Job): void {
    this.router.navigate(['/jobs', job.id]);
  }

  apply(job: Job): void {
    const url = String(job.applyUrl ?? '').trim();
    if (url) {
      window.open(url, '_blank', 'noopener');
      return;
    }
    this.openJob(job);
  }

  hasActiveFilters(): boolean {
    return (
      this.activeFilter() !== 'All' ||
      this.sourceFilter() !== 'All' ||
      this.typeFilter() !== 'All' ||
      this.experienceFilter() !== 'All' ||
      !!this.skillFilter() ||
      this.searchQuery().trim().length > 0
    );
  }

  /** Count of filters set from the Filters form dropdown (search box isn't included — it has its own field). */
  activeFilterCount(): number {
    let n = 0;
    if (this.activeFilter() !== 'All') n += 1;
    if (this.sourceFilter() !== 'All') n += 1;
    if (this.typeFilter() !== 'All') n += 1;
    if (this.experienceFilter() !== 'All') n += 1;
    if (this.skillFilter()) n += 1;
    return n;
  }

  clearFilters(): void {
    this.activeFilter.set('All');
    this.sourceFilter.set('All');
    this.typeFilter.set('All');
    this.experienceFilter.set('All');
    this.skillFilter.set(null);
    this.searchQuery.set('');
  }

  toggleSkill(skill: string): void {
    this.skillFilter.set(this.skillFilter() === skill ? null : skill);
  }

  toggleFilterPanel(event: Event): void {
    event.stopPropagation();
    this.filterPanelOpen.set(!this.filterPanelOpen());
  }

  handleDocClick(event: Event): void {
    if (!this.filterPanelOpen()) return;
    const wrap = this.filterWrap?.nativeElement;
    const target = event.target as Node | null;
    if (wrap && target && wrap.contains(target)) return;
    this.filterPanelOpen.set(false);
  }

  jobSource(job: Job): 'LinkedIn' | 'Naukri' | 'Community' {
    const explicit = String(job.source ?? '').trim();
    const normalized = explicit.toLowerCase();
    if (normalized === 'linkedin') return 'LinkedIn';
    if (normalized === 'naukri') return 'Naukri';
    if (normalized === 'community') return 'Community';

    const url = String(job.applyUrl ?? '').trim().toLowerCase();
    if (url.includes('linkedin.com')) return 'LinkedIn';
    if (url.includes('naukri.com')) return 'Naukri';
    return 'Community';
  }

  private matchesSearch(job: Job, q: string): boolean {
    const hay = [
      job.title,
      job.company,
      job.location,
      job.description,
      job.type,
      job.experience,
      job.salary,
      this.jobSource(job),
      ...(job.techStack ?? []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return hay.includes(q);
  }

  private matchesQuickFilter(job: Job, filter: string): boolean {
    const f = filter.trim().toLowerCase();
    if (!f || f === 'all') return true;
    if (f === 'remote') return job.type === 'Remote';
    if (f === 'angular') return this.matchesSearch(job, 'angular');
    if (f === 'full-stack') return this.matchesSearch(job, 'full') || this.matchesSearch(job, 'full-stack');
    if (f === 'fresher') return this.matchesSearch(job, 'fresher') || this.matchesSearch(job, '0-2');
    return this.matchesSearch(job, f);
  }
}
