import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LeaderboardEntry } from '../models';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class LeaderboardService {
  private readonly API = environment.apiUrl;
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  entries = signal<LeaderboardEntry[]>([]);
  loading = signal(false);

  load(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API}/leaderboard`).subscribe({
      next: res => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        const currentId = this.auth.currentUser()?.id ?? '';
        this.entries.set(list.map((e: any) => this.normalize(e, currentId)));
        this.loading.set(false);
      },
      error: () => {
        this.entries.set([]);
        this.loading.set(false);
      },
    });
  }

  private normalize(e: any, currentId: string): LeaderboardEntry {
    const id = e.id ?? e.userId ?? e._id ?? '';
    return {
      rank: Number(e.rank ?? 0),
      user: {
        id,
        name: e.name ?? '',
        avatar: e.avatarUrl ?? e.avatar ?? '',
        designation: e.designation ?? '',
        organisation: e.organisation ?? '',
        streak: Number(e.streak ?? 0),
      },
      points: Number(e.totalVotes ?? e.points ?? e.votes ?? 0),
      questionsCount: Number(e.questionsPosted ?? e.questionsCount ?? 0),
      isCurrentUser: !!id && id === currentId,
    };
  }
}
