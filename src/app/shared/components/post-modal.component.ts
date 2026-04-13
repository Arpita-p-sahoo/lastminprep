import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../core/services/question.service';

@Component({
  selector: 'app-post-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './post-modal.component.html',
  styleUrls: ['./post-modal.component.css'],
})
export class PostModalComponent {
  open = input<boolean>(false);
  close = output<void>();
  qs = inject(QuestionService);

  selectedTag = 'Angular';
  questionText = '';
  hashtags = '';

  techTags = ['Angular', 'React', 'Node.js', 'TypeScript', 'System Design', 'DevOps', 'Python'];

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close.emit();
  }

  submit(): void {
    if (!this.questionText.trim()) return;
    this.qs.post({
      title: this.questionText,
      techTag: this.selectedTag,
      hashtags: this.hashtags.split(' ').filter(h => h.startsWith('#')),
    });
    this.questionText = '';
    this.hashtags = '';
    this.close.emit();
  }
}
