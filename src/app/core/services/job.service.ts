import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Job } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JobService {
  private readonly API = environment.apiUrl;
  constructor(private http: HttpClient) {
    this.load();
  }
  jobs = signal<Job[]>([]);

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
    this.http.post<Job>(`${this.API}/jobs`, body).subscribe({
      next: created => this.jobs.update(j => [this.normalize(created), ...j]),
    });
  }

  private load(): void {
    this.http.get<Job[]>(`${this.API}/jobs`).subscribe({
      next: data => this.jobs.set(this.normalizeList(data)),
      error: () => this.jobs.set([]),
    });
  }

  private normalizeList(list: any[]): Job[] {
    return (list || []).map(item => this.normalize(item));
  }

  private normalize(item: any): Job {
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
      postedAt: item.postedAt ? new Date(item.postedAt) : new Date(),
      postedBy: item.postedBy ?? {},
    };
  }
}
