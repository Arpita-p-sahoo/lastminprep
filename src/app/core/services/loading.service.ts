import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private activeCount = signal(0);

  isLoading = computed(() => this.activeCount() > 0);

  start(): void {
    this.activeCount.update(v => v + 1);
  }

  stop(): void {
    this.activeCount.update(v => Math.max(0, v - 1));
  }
}
