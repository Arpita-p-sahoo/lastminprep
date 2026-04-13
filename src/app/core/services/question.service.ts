import { Injectable, signal } from '@angular/core';
import { Question } from '../models';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private auth: AuthService) {}
  questions = signal<Question[]>([
    { 
      id: '1', 
      title: 'What is the difference between Angular Signals and NgRx? When would you choose one over the other in a large-scale app?', 
      techTag: 'Angular', 
      hashtags: ['#signals', '#ngrx'], 
      votes: 284, 
      comments: 42, 
      author: { name: 'Rahul Dev', id: 'r1' }, 
      createdAt: new Date(), 
      isHot: true, 
      isVoted: true,
      thread: [
        { id: 'c1', author: { name: 'Arpita Sahoo', id: '1' }, text: 'Signals simplify reactive state without boilerplate. NgRx is great for complex flows.', createdAt: new Date(), replies: [
          { id: 'c1-1', author: { name: 'Sneha Backend' }, text: 'Agree. For cross-module state and effects, NgRx still shines.', createdAt: new Date() },
          { id: 'c1-2', author: { name: 'Kavya React' }, text: 'How do you handle undo/redo with Signals?', createdAt: new Date(), replies: [
            { id: 'c1-2-1', author: { name: 'Rahul Dev' }, text: 'Store a history stack and push patches. Signals are fast enough.', createdAt: new Date() }
          ]}
        ]},
        { id: 'c2', author: { name: 'Varun DevOps' }, text: 'Also consider team familiarity. NgRx patterns are well known.', createdAt: new Date() }
      ]
    },
    { 
      id: '2', 
      title: 'Explain the Node.js event loop in detail. How does it handle I/O operations without blocking the main thread?', 
      techTag: 'Node.js', 
      hashtags: ['#eventloop', '#async'], 
      votes: 201, 
      comments: 38, 
      author: { name: 'Sneha Backend', id: 's1' }, 
      createdAt: new Date(),
      thread: [
        { id: 'c3', author: { name: 'Arpita Sahoo' }, text: 'Phases: timers, pending callbacks, idle/prepare, poll, check, close.', createdAt: new Date() },
        { id: 'c4', author: { name: 'Mohit DBA' }, text: 'Libuv offloads I/O to threads, then schedules callbacks.', createdAt: new Date(), replies: [
          { id: 'c4-1', author: { name: 'Sneha Backend' }, text: 'Exactly. CPU-bound tasks should use workers.', createdAt: new Date() }
        ]}
      ]
    },
    { id: '3', title: 'Design a real-time collaborative document editor like Google Docs. Focus on conflict resolution and sync strategies.', techTag: 'System Design', hashtags: ['#scalability'], votes: 176, comments: 27, author: { name: 'Priya SDE', id: 'p1' }, createdAt: new Date(), isNew: true },
    { id: '4', title: 'Explain TypeScript generics with a real-world example. When should you use them vs `any`?', techTag: 'TypeScript', hashtags: ['#generics'], votes: 198, comments: 31, author: { name: 'Arpita Sahoo', id: '1' }, createdAt: new Date(), isSaved: true, thread: [
      { id: 'c5', author: { name: 'Rahul Dev' }, text: 'Use generics to preserve type relationships, e.g., Result<T>.', createdAt: new Date() }
    ] },
    { id: '5', title: 'How do you optimise slow PostgreSQL queries? Walk through your debugging process step by step.', techTag: 'PostgreSQL', hashtags: ['#indexing', '#performance'], votes: 312, comments: 56, author: { name: 'Mohit DBA', id: 'm1' }, createdAt: new Date(), isHot: true },
    { id: '6', title: 'When should you use useMemo and useCallback in React? Can overusing them actually hurt performance?', techTag: 'React', hashtags: ['#performance', '#hooks'], votes: 167, comments: 29, author: { name: 'Kavya React', id: 'k1' }, createdAt: new Date() },
    { id: '7', title: "What's the difference between CMD and ENTRYPOINT in a Dockerfile? Provide real-world examples.", techTag: 'Docker', hashtags: ['#containers', '#devops'], votes: 143, comments: 18, author: { name: 'Varun DevOps', id: 'v1' }, createdAt: new Date() },
    { id: '8', title: 'What are common RxJS patterns you use daily in Angular applications?', techTag: 'Angular', hashtags: ['#rxjs', '#observables'], votes: 145, comments: 22, author: { name: 'Arpita Sahoo', id: '1' }, createdAt: new Date() },
  ]);

  vote(id: string): void {
    this.questions.update(qs =>
      qs.map(q => q.id === id ? { ...q, votes: q.isVoted ? q.votes - 1 : q.votes + 1, isVoted: !q.isVoted } : q)
    );
  }

  save(id: string): void {
    this.questions.update(qs =>
      qs.map(q => q.id === id ? { ...q, isSaved: !q.isSaved } : q)
    );
  }

  post(q: Partial<Question>): void {
    const newQ: Question = {
      id: Date.now().toString(),
      title: q.title || '',
      techTag: q.techTag || 'General',
      hashtags: q.hashtags || [],
      votes: 0,
      comments: 0,
      author: { name: 'Arpita Sahoo', id: '1' },
      createdAt: new Date(),
      isNew: true,
    };
    this.questions.update(qs => [newQ, ...qs]);
  }

  comment(questionId: string, text: string): void {
    const author = this.auth.currentUser() ?? { id: '0', name: 'Anonymous' };
    this.questions.update(qs =>
      qs.map(q => {
        if (q.id !== questionId) return q;
        const newComment = {
          id: Date.now().toString(),
          author,
          text,
          createdAt: new Date(),
        };
        const thread = q.thread ? [...q.thread, newComment] : [newComment];
        return { ...q, thread, comments: (q.comments ?? 0) + 1 };
      })
    );
  }

  delete(id: string): void {
    this.questions.update(qs => qs.filter(q => q.id !== id));
  }

  getByAuthor(authorId: string): Question[] {
    return this.questions().filter(q => q.author.id === authorId);
  }

  getSaved(): Question[] {
    return this.questions().filter(q => q.isSaved);
  }
}
