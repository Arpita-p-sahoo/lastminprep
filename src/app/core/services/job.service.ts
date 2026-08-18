import { Injectable, computed, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Job } from '../models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { environment } from '../../../environments/environment';
import { Observable, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly API = environment.apiUrl;
  constructor(private auth: AuthService, private http: HttpClient, private toast: ToastService) {
    this.load();
    effect(
      () => {
        const userId = this.userKey();
        const lastSeen = this.loadOrInitJobsLastSeen(userId);
        this.jobsLastSeen.set(lastSeen);
        this.savedJobs.set([]);
        if (this.auth.isLoggedIn()) {
          this.loadSaved();
        }
      },
      { allowSignalWrites: true }
    );
  }
  jobs = signal<Job[]>([]);
  loading = signal(true);
  followingJobs = signal<Job[]>([]);
  loadingFollowing = signal(false);
  private jobsLastSeen = signal<number>(0);
  savedJobs = signal<Job[]>([]);
  private savedJobIdSet = computed(() => {
    const set = new Set<string>();
    for (const j of this.savedJobs()) set.add(String(j.id));
    for (const j of this.jobs()) if (j.isSaved) set.add(String(j.id));
    return set;
  });
  newJobsCount = computed(() => {
    const lastSeen = this.jobsLastSeen();
    if (!lastSeen) return 0;
    const lastSeenMs = Number(lastSeen);
    if (!Number.isFinite(lastSeenMs) || lastSeenMs <= 0) return 0;

    let count = 0;
    for (const j of this.jobs()) {
      const t = j.postedAt instanceof Date ? j.postedAt.getTime() : new Date(j.postedAt as any).getTime();
      if (Number.isFinite(t) && t > lastSeenMs) count += 1;
    }
    return count;
  });

  markJobsSeen(at?: number): void {
    const userId = this.userKey();
    const now = typeof at === 'number' && Number.isFinite(at) ? Math.max(0, Math.floor(at)) : Date.now();
    const key = this.jobsLastSeenStorageKey(userId);
    try {
      localStorage.setItem(key, String(now));
    } catch { }
    this.jobsLastSeen.set(now);
  }

  markJobsSeenToLatest(): void {
    const latest = this.jobs().reduce((max, j) => {
      const t = j.postedAt instanceof Date ? j.postedAt.getTime() : new Date(j.postedAt as any).getTime();
      return Number.isFinite(t) ? Math.max(max, t) : max;
    }, 0);
    this.markJobsSeen(latest || Date.now());
  }

  loadSaved(): void {
    this.http.get<any>(`${this.API}/jobs/saved`).subscribe({
      next: res => {
        const list = this.normalizeList(res);
        const saved = list.map(j => ({ ...j, isSaved: true }));
        this.savedJobs.set(saved);
        this.jobs.update(existing => {
          const next = [...existing];
          for (const s of saved) {
            const idx = next.findIndex(x => String(x.id) === String(s.id));
            if (idx === -1) next.unshift(s);
            else next[idx] = { ...next[idx], ...s, isSaved: true };
          }
          return next;
        });
      },
      error: () => this.savedJobs.set([]),
    });
  }

  isJobSaved(id: string): boolean {
    return this.savedJobIdSet().has(String(id));
  }

  toggleJobSaved(id: string): void {
    const jobId = String(id);
    if (!jobId) return;
    this.http.post<any>(`${this.API}/jobs/${jobId}/save`, {}).subscribe({
      next: res => {
        const isSaved = typeof res?.isSaved === 'boolean' ? res.isSaved : undefined;
        const saved = typeof isSaved === 'boolean' ? isSaved : !this.isJobSaved(jobId);
        this.jobs.update(list =>
          list.map(j => (String(j.id) === jobId ? { ...j, isSaved: saved } : j))
        );
        if (saved) {
          const found = this.getById(jobId);
          if (found) {
            this.savedJobs.update(items => {
              const exists = items.some(x => String(x.id) === jobId);
              return exists ? items : [{ ...found, isSaved: true }, ...items];
            });
          }
        } else {
          this.savedJobs.update(items => items.filter(x => String(x.id) !== jobId));
        }
        this.toast.success(saved ? 'Job saved' : 'Removed from saved');
      },
      error: () => this.toast.error('Failed to save job'),
    });
  }

  getById(id: string): Job | null {
    const found = this.jobs().find(j => String(j.id) === String(id));
    return found ?? null;
  }

  fetchById(id: string): Observable<Job> {
    return this.http.get<any>(`${this.API}/jobs/${id}`).pipe(
      map(res => this.normalize(res?.data ?? res?.item ?? res)),
      tap(job => {
        this.jobs.update(list => {
          const idx = list.findIndex(x => String(x.id) === String(job.id));
          if (idx === -1) return [job, ...list];
          const next = [...list];
          next[idx] = { ...next[idx], ...job };
          return next;
        });
      })
    );
  }

  post(job: Partial<Job>): void {
    const body = {
      title: job.title || '',
      company: job.company || '',
      location: job.location || '',
      type: job.type || 'Remote',
      experience: job.experience || '',
      salary: job.salary || '',
      techStack: job.techStack || [],
      description: job.description || '',
    };
    this.http.post<any>(`${this.API}/jobs`, body).subscribe({
      next: res => {
        const created = res?.data ?? res?.item ?? res;
        const normalized = this.normalize(created);
        if (job.source) normalized.source = job.source;
        if (job.applyUrl) normalized.applyUrl = job.applyUrl;
        if (job.postedBy) normalized.postedBy = { ...(normalized.postedBy ?? {}), ...(job.postedBy ?? {}) };
        if (job.postedAt) normalized.postedAt = job.postedAt instanceof Date ? job.postedAt : new Date(job.postedAt as any);
        this.jobs.update(j => [normalized, ...j]);
        this.toast.success('Job posted');
      },
      error: () => this.toast.error('Failed to post job'),
    });
  }

  delete(id: string, callbacks?: { onSuccess?: () => void; onError?: () => void }): void {
    this.http.delete(`${this.API}/jobs/${id}`).subscribe({
      next: () => {
        this.jobs.update(list => list.filter(j => String(j.id) !== String(id)));
        callbacks?.onSuccess?.();
      },
      error: () => {
        callbacks?.onError?.();
      },
    });
  }

  /** Re-fetches the job list from the server; used to refresh on demand (e.g. clicking the Jobs nav link). */
  refresh(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API}/jobs`).subscribe({
      next: data => {
        this.jobs.set(this.normalizeList(data));
        this.loading.set(false);
      },
      error: () => {
        this.jobs.set([]);
        this.loading.set(false);
      },
    });
  }

  loadFollowingFeed(): void {
    if (!this.auth.isLoggedIn()) {
      this.followingJobs.set([]);
      this.loadingFollowing.set(false);
      return;
    }
    this.loadingFollowing.set(true);
    this.http.get<any>(`${this.API}/jobs/following`).subscribe({
      next: data => {
        const list = this.normalizeList(data);
        this.followingJobs.set(list);
        this.loadingFollowing.set(false);
      },
      error: () => {
        this.followingJobs.set([]);
        this.loadingFollowing.set(false);
      },
    });
  }

  private normalizeList(list: any[]): Job[] {
    const raw = Array.isArray(list)
      ? list
      : Array.isArray((list as any)?.data)
        ? (list as any).data
        : Array.isArray((list as any)?.items)
          ? (list as any).items
          : Array.isArray((list as any)?.results)
            ? (list as any).results
            : [];
    return raw.map((item: any) => this.normalize(item));
  }

  private normalize(item: any): Job {
    const rawPostedBy = item?.postedBy ?? item?.poster ?? item?.createdBy ?? item?.user ?? item?.author ?? {};
    const postedBy =
      typeof rawPostedBy === 'string'
        ? { name: rawPostedBy }
        : (rawPostedBy && typeof rawPostedBy === 'object' ? rawPostedBy : {});

    return {
      id: String(item.id ?? item._id ?? ''),
      title: item.title ?? '',
      company: item.company ?? '',
      location: item.location ?? '',
      type: item.type ?? 'Remote',
      experience: item.experience ?? '',
      salary: item.salary ?? '',
      techStack: Array.isArray(item.techStack)
        ? item.techStack
        : (item.techStack ? String(item.techStack).split(',').map((s: string) => s.trim()).filter(Boolean) : []),
      description: item.description ?? '',
      source: item.source ?? item.platform ?? item.site ?? '',
      applyUrl: item.applyUrl ?? item.apply_link ?? item.applyLink ?? item.url ?? '',
      postedAt: item.postedAt ? new Date(item.postedAt) : new Date(),
      postedBy: {
        ...postedBy,
        id: postedBy.id ?? postedBy._id ?? '',
        name: postedBy.name ?? postedBy.fullName ?? '',
        email: postedBy.email ?? item.postedByEmail ?? item.posterEmail ?? '',
        linkedinUrl: postedBy.linkedinUrl ?? postedBy.linkedin ?? item.postedByLinkedinUrl ?? item.posterLinkedinUrl ?? '',
      },
      isSaved: typeof item.isSaved === 'boolean' ? item.isSaved : undefined,
    };
  }

  private userKey(): string {
    const id = this.auth.currentUser()?.id;
    return id ? String(id) : 'anon';
  }

  private jobsLastSeenStorageKey(userId: string): string {
    return `lmp_jobs_last_seen:${userId}`;
  }

  private loadOrInitJobsLastSeen(userId: string): number {
    const key = this.jobsLastSeenStorageKey(userId);
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? Number(raw) : NaN;
      if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
      const now = Date.now();
      localStorage.setItem(key, String(now));
      return now;
    } catch {
      return Date.now();
    }
  }
}
