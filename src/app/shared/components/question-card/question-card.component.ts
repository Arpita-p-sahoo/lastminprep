import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Comment, Question } from '../../../core/models';
import { QuestionService } from '../../../core/services/question.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './question-card.component.html',
  styleUrls: ['./question-card.component.css'],
})
export class QuestionCardComponent {
  question = input.required<Question>();
  qs = inject(QuestionService);
  auth = inject(AuthService);
  showComments = false;
  newComment = '';
  toggleComments(): void { this.showComments = !this.showComments; }
  addComment(): void {
    const t = this.newComment.trim();
    if (!t) return;
    const id = this.question()?.id;
    if (id) this.qs.comment(id, t);
    this.newComment = '';
    this.showComments = true;
  }

  get authorInitial(): string {
    return this.question()?.author.name?.charAt(0) ?? '';
  }

  get authorHandle(): string {
    const name = this.question()?.author.name;
    return name ? name.toLowerCase().replace(' ', '_') : '';
  }
  get authorRoute(): any[] | null {
    const id = this.question()?.author.id;
    return id ? ['/user', id] : null;
  }

  get canDelete(): boolean {
    const currentId = this.auth.currentUser()?.id;
    const authorId = this.question()?.author.id;
    return !!currentId && !!authorId && String(currentId) === String(authorId);
  }

  canDeleteComment(c: Comment): boolean {
    const currentId = this.auth.currentUser()?.id;
    const authorId = c?.author?.id;
    return !!currentId && !!authorId && String(currentId) === String(authorId);
  }

  deleteQuestion(): void {
    const id = this.question()?.id;
    if (id) this.qs.delete(id);
  }

  deleteComment(commentId: string): void {
    const questionId = this.question()?.id;
    if (!questionId || !commentId) return;
    this.qs.deleteComment(questionId, commentId);
  }
}
