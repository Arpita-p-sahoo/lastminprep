import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Question } from '../models';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly API = environment.apiUrl;
  constructor(private auth: AuthService, private http: HttpClient) {
    this.loadAll();
  }
  questions = signal<Question[]>([]);

  loadAll(): void {
    this.http.get<Question[]>(`${this.API}/questions`).subscribe({
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
    const body: any = { text };
    if (author?.id) body.authorId = author.id;
    this.http.post<{ comment: any }>(`${this.API}/questions/${questionId}/comments`, body).subscribe({
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

  delete(id: string): void {
    this.http.delete(`${this.API}/questions/${id}`).subscribe({
      next: () => this.questions.update(qs => qs.filter(q => q.id !== id)),
    });
  }

  private normalizeList(list: any[]): Question[] {
    return (list || []).map(item => this.normalize(item));
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
