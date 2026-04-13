import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TagOptionsService {
  private loaded = false;
  tags = signal<string[]>([]);
  loading = signal(false);

  constructor(private http: HttpClient) {}

  ensureLoaded(): void {
    if (this.loaded || this.loading()) return;
    this.loading.set(true);

    const params = new HttpParams()
      .set('order', 'desc')
      .set('sort', 'popular')
      .set('site', 'stackoverflow')
      .set('pagesize', '200');

    this.http.get<any>('https://api.stackexchange.com/2.3/tags', { params }).subscribe({
      next: (res) => {
        const items = Array.isArray(res?.items) ? res.items : [];
        const list = items
          .map((t: any) => String(t?.name ?? '').trim())
          .filter(Boolean);
        this.tags.set(Array.from(new Set(list)));
        this.loaded = true;
      },
      error: () => {
        this.tags.set([]);
      },
      complete: () => {
        this.loading.set(false);
      },
    });
  }
}

