import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Question } from '../models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { Observable, map, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly API = environment.apiUrl;
  constructor(private auth: AuthService, private http: HttpClient) {
    this.loadAll();
  }
  questions = signal<Question[]>([]);

  loadAll(): void {
    this.http.get<any>(`${this.API}/questions`).subscribe({
      next: data => this.questions.set(this.normalizeList(data)),
      error: () => this.questions.set([]),
    });
  }

  getByAuthor(authorId: string): Question[] {
    return this.questions().filter(q => String(q.author.id) === String(authorId));
  }

  getSaved(): Question[] {
    return this.questions().filter(q => q.isSaved);
  }

  getById(id: string): Question | null {
    const q = this.questions().find(x => String(x.id) === String(id));
    return q ?? null;
  }

  fetchById(id: string): Observable<Question> {
    return this.http.get<any>(`${this.API}/questions/${id}`).pipe(
      map(res => this.normalize(res?.data ?? res?.item ?? res)),
      tap(q => {
        this.questions.update(qs => {
          const idx = qs.findIndex(x => x.id === q.id);
          if (idx === -1) return [q, ...qs];
          const next = [...qs];
          next[idx] = { ...next[idx], ...q };
          return next;
        });
      })
    );
  }

  vote(id: string): void {
    this.http.post<{ votes?: number; isVoted?: boolean }>(`${this.API}/questions/${id}/vote`, {}).subscribe({
      next: res => {
        this.questions.update(qs =>
          qs.map(q =>
            q.id === id
              ? {
                ...q,
                votes: typeof res.votes === 'number' ? res.votes : (q.isVoted ? q.votes - 1 : q.votes + 1),
                isVoted: typeof res.isVoted === 'boolean' ? res.isVoted : !q.isVoted,
              }
              : q
          )
        );
      },
    });
  }

  save(id: string): void {
    this.http.post<{ isSaved?: boolean }>(`${this.API}/questions/${id}/save`, {}).subscribe({
      next: res => {
        this.questions.update(qs =>
          qs.map(q => (q.id === id ? { ...q, isSaved: typeof res.isSaved === 'boolean' ? res.isSaved : !q.isSaved } : q))
        );
      },
    });
  }

  post(q: Partial<Question>): void {
    const body = {
      title: q.title || '',
      techTag: q.techTag || 'General',
      hashtags: q.hashtags || [],
    };
    this.http.post<Question>(`${this.API}/questions`, body).subscribe({
      next: created => this.questions.update(qs => [this.normalize(created), ...qs]),
    });
  }

  comment(questionId: string, text: string): void {
    const author = this.auth.currentUser();
    this.http.post<{ comment: any }>(`${this.API}/questions/${questionId}/comments`, { text }).subscribe({
      next: res => {
        const comment = res?.comment ?? { id: Date.now().toString(), author, text, createdAt: new Date() };
        this.questions.update(qs =>
          qs.map(q => {
            if (q.id !== questionId) return q;
            const thread = q.thread ? [...q.thread, comment] : [comment];
            return { ...q, thread, comments: (q.comments ?? 0) + 1 };
          })
        );
      },
    });
  }

  delete(id: string): void;
  delete(id: string, callbacks?: { onSuccess?: () => void; onError?: () => void }): void;
  delete(id: string, callbacks?: { onSuccess?: () => void; onError?: () => void }): void {
    this.http.delete(`${this.API}/questions/${id}`).subscribe({
      next: () => {
        this.questions.update(qs => qs.filter(q => q.id !== id));
        callbacks?.onSuccess?.();
      },
      error: () => {
        callbacks?.onError?.();
      },
    });
  }

  private normalizeList(list: any[]): Question[] {
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

  private normalize(item: any): Question {
    return {
      id: String(item.id ?? item._id ?? ''),
      title: item.title ?? '',
      techTag: item.techTag ?? item.tag ?? 'General',
      hashtags: Array.isArray(item.hashtags)
        ? item.hashtags
        : (item.hashtags ? String(item.hashtags).split(' ').filter(Boolean) : []),
      votes: Number(item.votes ?? 0),
      comments: Number(item.comments ?? 0),
      author: item.author ?? { id: item.authorId, name: item.authorName },
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      isHot: !!item.isHot,
      isNew: !!item.isNew,
      isSaved: !!item.isSaved,
      isVoted: !!item.isVoted,
      thread: item.thread,
    };
  }
}
