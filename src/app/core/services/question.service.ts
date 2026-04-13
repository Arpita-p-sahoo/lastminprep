import { Injectable, computed, effect, signal } from '@angular/core';
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
    effect(
      () => {
        const userId = this.userKey();
        const lastSeen = this.loadOrInitFeedLastSeen(userId);
        this.feedLastSeen.set(lastSeen);
      },
      { allowSignalWrites: true }
    );
  }
  questions = signal<Question[]>([]);
  loading = signal(true);
  private feedLastSeen = signal<number>(0);
  newFeedCount = computed(() => {
    const lastSeen = this.feedLastSeen();
    if (!lastSeen) return 0;
    const lastSeenMs = Number(lastSeen);
    if (!Number.isFinite(lastSeenMs) || lastSeenMs <= 0) return 0;

    let count = 0;
    for (const q of this.questions()) {
      const t = q.createdAt instanceof Date ? q.createdAt.getTime() : new Date(q.createdAt as any).getTime();
      if (Number.isFinite(t) && t > lastSeenMs) count += 1;
    }
    return count;
  });

  markFeedSeen(at?: number): void {
    const userId = this.userKey();
    const now = typeof at === 'number' && Number.isFinite(at) ? Math.max(0, Math.floor(at)) : Date.now();
    const key = this.feedLastSeenStorageKey(userId);
    try {
      localStorage.setItem(key, String(now));
    } catch { }
    this.feedLastSeen.set(now);
  }

  markFeedSeenToLatest(): void {
    const latest = this.questions().reduce((max, q) => {
      const t = q.createdAt instanceof Date ? q.createdAt.getTime() : new Date(q.createdAt as any).getTime();
      return Number.isFinite(t) ? Math.max(max, t) : max;
    }, 0);
    this.markFeedSeen(latest || Date.now());
  }

  loadAll(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API}/questions`).subscribe({
      next: data => {
        const list = this.normalizeList(data);
        list.sort((a, b) => {
          const at = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime();
          const bt = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime();
          return (Number.isFinite(bt) ? bt : 0) - (Number.isFinite(at) ? at : 0);
        });
        this.questions.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.questions.set([]);
        this.loading.set(false);
      },
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

  loadSaved(): void {
    this.http.get<any>(`${this.API}/questions/saved`).subscribe({
      next: res => {
        const list = this.normalizeList(res);
        this.questions.update(existing => {
          const next = [...existing];
          for (const q of list) {
            const saved = { ...q, isSaved: true };
            const idx = next.findIndex(x => String(x.id) === String(saved.id));
            if (idx === -1) next.unshift(saved);
            else next[idx] = { ...next[idx], ...saved, isSaved: true };
          }
          return next;
        });
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
      next: created => {
        const normalized = this.normalize(created);
        this.questions.update(qs => [normalized, ...qs.filter(x => String(x.id) !== String(normalized.id))]);
        const user = this.auth.currentUser();
        if (user?.id && normalized.author?.id && String(user.id) === String(normalized.author.id)) {
          this.auth.updateLocalUser({ questionsPosted: (user.questionsPosted ?? 0) + 1 });
        }
      },
    });
  }

  update(
    id: string,
    q: Partial<Question>,
    callbacks?: { onSuccess?: () => void; onError?: () => void }
  ): void {
    const questionId = String(id);
    if (!questionId) return;
    const body = {
      title: q.title ?? '',
      techTag: q.techTag ?? 'General',
      hashtags: Array.isArray(q.hashtags) ? q.hashtags : [],
    };

    const applyLocalPatch = (patch: Partial<Question>) => {
      this.questions.update(list =>
        list.map(item =>
          String(item.id) === questionId
            ? {
              ...item,
              ...(patch.title !== undefined ? { title: String(patch.title) } : {}),
              ...(patch.techTag !== undefined ? { techTag: String(patch.techTag) } : {}),
              ...(patch.hashtags !== undefined ? { hashtags: Array.isArray(patch.hashtags) ? patch.hashtags : item.hashtags } : {}),
            }
            : item
        )
      );
    };

    const handleSuccess = (res: any) => {
      const raw = res?.data ?? res?.item ?? res;
      if (raw && typeof raw === 'object') {
        const normalized = this.normalize(raw);
        this.questions.update(list => list.map(item => (String(item.id) === questionId ? { ...item, ...normalized } : item)));
      } else {
        applyLocalPatch(body as any);
      }
      callbacks?.onSuccess?.();
    };

    const handleError = () => callbacks?.onError?.();

    this.http.patch<any>(`${this.API}/questions/${questionId}`, body).subscribe({
      next: handleSuccess,
      error: () => {
        this.http.put<any>(`${this.API}/questions/${questionId}`, body).subscribe({
          next: handleSuccess,
          error: handleError,
        });
      },
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
        if (author?.id && comment.author?.id && String(author.id) === String(comment.author.id)) {
          this.auth.updateLocalUser({ answeredCount: (author.answeredCount ?? 0) + 1 });
        }
      },
    });
  }

  deleteComment(questionId: string, commentId: string, callbacks?: { onSuccess?: () => void; onError?: () => void }): void {
    const currentUser = this.auth.currentUser();
    this.http.delete(`${this.API}/comments/${commentId}`).subscribe({
      next: () => {
        let deletedAuthorId: string | undefined;
        this.questions.update(qs =>
          qs.map(q => {
            if (q.id !== questionId) return q;
            const res = this.removeCommentFromThread(q.thread ?? [], commentId);
            deletedAuthorId = res.deleted?.author?.id ? String(res.deleted.author.id) : undefined;
            if (!res.deleted) return q;
            return {
              ...q,
              thread: res.thread.length ? res.thread : undefined,
              commentCount: Math.max(0, (q.commentCount ?? 0) - 1),
            };
          })
        );
        if (currentUser?.id && deletedAuthorId && String(currentUser.id) === String(deletedAuthorId)) {
          this.auth.updateLocalUser({ answeredCount: Math.max(0, (currentUser.answeredCount ?? 0) - 1) });
        }
        callbacks?.onSuccess?.();
      },
      error: () => {
        callbacks?.onError?.();
      },
    });
  }

  delete(id: string): void;
  delete(id: string, callbacks?: { onSuccess?: () => void; onError?: () => void }): void;
  delete(id: string, callbacks?: { onSuccess?: () => void; onError?: () => void }): void {
    const userId = this.auth.currentUser()?.id;
    const existing = this.getById(id);
    this.http.delete(`${this.API}/questions/${id}`).subscribe({
      next: () => {
        this.questions.update(qs => qs.filter(q => q.id !== id));
        if (userId && existing?.author?.id && String(existing.author.id) === String(userId)) {
          const current = this.auth.currentUser();
          if (current) this.auth.updateLocalUser({ questionsPosted: Math.max(0, (current.questionsPosted ?? 0) - 1) });
        }
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
    const authorId =
      rawAuthor && typeof rawAuthor === 'object'
        ? (rawAuthor.id ?? rawAuthor._id ?? item.authorId ?? item.authorID)
        : (item.authorId ?? item.authorID ?? rawAuthor);
    const authorName =
      rawAuthor && typeof rawAuthor === 'object'
        ? (rawAuthor.name ?? item.authorName)
        : item.authorName;
    const rawAvatar =
      rawAuthor && typeof rawAuthor === 'object'
        ? (rawAuthor.avatar ?? rawAuthor.avatarUrl ?? rawAuthor.photo ?? rawAuthor.image ?? '')
        : (item.authorAvatar ?? item.authorAvatarUrl ?? item.authorPhoto ?? '');
    const current = this.auth.currentUser();
    const authorAvatar =
      String(rawAvatar ?? '').trim() ||
      (current?.id && authorId && String(current.id) === String(authorId) ? String(current.avatar ?? '').trim() : '');
    const author = { id: authorId ?? '', name: authorName ?? '', avatar: authorAvatar };

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
    const authorId =
      rawAuthor && typeof rawAuthor === 'object'
        ? (rawAuthor.id ?? rawAuthor._id ?? c.authorId ?? c.userId)
        : (c.authorId ?? c.userId ?? rawAuthor);
    const authorName =
      rawAuthor && typeof rawAuthor === 'object'
        ? (rawAuthor.name ?? c.authorName ?? c.userName)
        : (c.authorName ?? c.userName);
    const rawAvatar =
      rawAuthor && typeof rawAuthor === 'object'
        ? (rawAuthor.avatar ?? rawAuthor.avatarUrl ?? rawAuthor.photo ?? rawAuthor.image ?? '')
        : (c.authorAvatar ?? c.authorAvatarUrl ?? c.userAvatar ?? c.userAvatarUrl ?? '');
    const current = this.auth.currentUser();
    const authorAvatar =
      String(rawAvatar ?? '').trim() ||
      (current?.id && authorId && String(current.id) === String(authorId) ? String(current.avatar ?? '').trim() : '');
    const author = { id: authorId ?? '', name: authorName ?? '', avatar: authorAvatar };

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

  private removeCommentFromThread(thread: Comment[], commentId: string): { thread: Comment[]; deleted: Comment | null } {
    let deleted: Comment | null = null;
    const next: Comment[] = [];

    for (const c of thread) {
      if (String(c.id) === String(commentId)) {
        deleted = c;
        continue;
      }
      if (c.replies?.length) {
        const r = this.removeCommentFromThread(c.replies, commentId);
        if (r.deleted) deleted = r.deleted;
        const updated = r.deleted ? { ...c, replies: r.thread.length ? r.thread : undefined } : c;
        next.push(updated);
      } else {
        next.push(c);
      }
    }

    return { thread: next, deleted };
  }

  private userKey(): string {
    const id = this.auth.currentUser()?.id;
    return id ? String(id) : 'anon';
  }

  private feedLastSeenStorageKey(userId: string): string {
    return `lmp_feed_last_seen:${userId}`;
  }

  private loadOrInitFeedLastSeen(userId: string): number {
    const key = this.feedLastSeenStorageKey(userId);
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
