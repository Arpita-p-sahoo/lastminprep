import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TagOptionsService {
  private loaded = false;
  tags = signal<string[]>([]);
  loading = signal(false);

  constructor() { }

  ensureLoaded(): void {
    if (this.loaded || this.loading()) return;
    this.loading.set(true);
    const manual = [
      'Angular',
      'React',
      'Vue.js',
      'Svelte',
      'Next.js',
      'Node.js',
      'NestJS',
      'Express',
      'TypeScript',
      'JavaScript',
      'HTML',
      'CSS',
      'Tailwind CSS',
      'RxJS',
      'NgRx',
      'Redux',
      'GraphQL',
      'REST',
      'PostgreSQL',
      'MySQL',
      'MongoDB',
      'Redis',
      'Docker',
      'Kubernetes',
      'AWS',
      'GCP',
      'Azure',
      'System Design',
      'DevOps',
      'DSA',
      'Python',
      'Java',
      'Go',
    ];
    this.tags.set(manual);
    this.loaded = true;
    this.loading.set(false);
  }
}
