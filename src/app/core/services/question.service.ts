import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Comment, Question } from '../models';
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
    this.http.post<{ votes?: number; voteCount?: number; isVoted?: boolean }>(`${this.API}/questions/${id}/vote`, {}).subscribe({
      next: res => {
        this.questions.update(qs =>
          qs.map(q =>
            q.id === id
              ? {
                ...q,
                votes:
                  typeof res.votes === 'number'
                    ? res.votes
                    : typeof res.voteCount === 'number'
                      ? res.voteCount
                      : (q.isVoted ? q.votes - 1 : q.votes + 1),
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
        const comment = this.normalizeComment(res?.comment ?? { id: Date.now().toString(), author, text, createdAt: new Date() });
        this.questions.update(qs =>
          qs.map(q => {
            if (q.id !== questionId) return q;
            const thread = q.thread ? [...q.thread, comment] : [comment];
            return { ...q, thread, commentCount: (q.commentCount ?? 0) + 1 };
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
    const rawAuthor = item?.author;
    const author =
      rawAuthor && typeof rawAuthor === 'object'
        ? { id: rawAuthor.id ?? rawAuthor._id ?? item.authorId ?? item.authorID, name: rawAuthor.name ?? item.authorName }
        : { id: item.authorId ?? item.authorID ?? rawAuthor, name: item.authorName };

    const thread = this.normalizeThread(
      item?.thread ??
      item?.commentsThread ??
      item?.threadItems ??
      (Array.isArray(item?.comments) ? item.comments : null)
    );
    const commentsCount =
      typeof item?.commentCount === 'number'
        ? Number(item.commentCount ?? 0)
        : typeof item?.comments === 'number'
          ? Number(item.comments ?? 0)
          : (thread ? thread.length : (Array.isArray(item?.comments) ? item.comments.length : 0));

    return {
      id: String(item.id ?? item._id ?? ''),
      title: item.title ?? '',
      techTag: item.techTag ?? item.tag ?? 'General',
      hashtags: Array.isArray(item.hashtags)
        ? item.hashtags
        : (item.hashtags ? String(item.hashtags).split(' ').filter(Boolean) : []),
      votes: Number(item.votes ?? item.voteCount ?? 0),
      commentCount: commentsCount,
      author,
      createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
      isHot: !!item.isHot,
      isNew: !!item.isNew,
      isSaved: !!item.isSaved,
      isVoted: !!item.isVoted,
      thread: thread?.length ? thread : undefined,
    };
  }

  private normalizeThread(raw: any): Comment[] | undefined {
    const list = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.data)
        ? raw.data
        : Array.isArray(raw?.items)
          ? raw.items
          : Array.isArray(raw?.results)
            ? raw.results
            : undefined;
    if (!list?.length) return undefined;
    return list.map((c: any) => this.normalizeComment(c));
  }

  private normalizeComment(c: any): Comment {
    const rawAuthor = c?.author;
    const author =
      rawAuthor && typeof rawAuthor === 'object'
        ? { id: rawAuthor.id ?? rawAuthor._id ?? c.authorId ?? c.userId, name: rawAuthor.name ?? c.authorName ?? c.userName }
        : { id: c.authorId ?? c.userId ?? rawAuthor, name: c.authorName ?? c.userName };

    const createdAt = c?.createdAt ? new Date(c.createdAt) : new Date();
    const replies = this.normalizeThread(c?.replies);
    return {
      id: String(c?.id ?? c?._id ?? ''),
      author,
      text: c?.text ?? c?.message ?? '',
      createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
      replies: replies?.length ? replies : undefined,
    };
  }
}
