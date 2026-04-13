import { Injectable, computed, effect, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Job } from '../models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Observable, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly API = environment.apiUrl;
  constructor(private auth: AuthService, private http: HttpClient) {
    this.load();
    effect(
      () => {
        const userId = this.userKey();
        const lastSeen = this.loadOrInitJobsLastSeen(userId);
        this.jobsLastSeen.set(lastSeen);
      },
      { allowSignalWrites: true }
    );
  }
  jobs = signal<Job[]>([]);
  private jobsLastSeen = signal<number>(0);
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
      },
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

  private load(): void {
    this.http.get<any>(`${this.API}/jobs`).subscribe({
      next: data => this.jobs.set(this.normalizeList(data)),
      error: () => this.jobs.set([]),
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
