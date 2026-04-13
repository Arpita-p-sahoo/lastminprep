import { Component, effect, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuestionService } from '../../core/services/question.service';
import { TagOptionsService } from '../../core/services/tag-options.service';

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
  tagOptions = inject(TagOptionsService);

  questionText = '';
  selectedTech = [] as string[];
  suggestedTech = [] as string[];
  techTouched = false;
  suggestTimer: any = null;

  hashtagQuery = '';
  hashtagOpen = false;
  selectedHashtags = [] as string[];

  constructor() {
    effect(() => {
      if (this.open()) {
        this.tagOptions.ensureLoaded();
        this.computeSuggestions();
      }
    });
    effect(() => {
      const isOpen = this.open();
      const tagsCount = this.tagOptions.tags().length;
      if (isOpen && tagsCount) this.computeSuggestions();
    });
  }

  onOverlayClick(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close.emit();
  }

  onQuestionInput(): void {
    if (this.suggestTimer) clearTimeout(this.suggestTimer);
    this.suggestTimer = setTimeout(() => this.computeSuggestions(), 250);
  }

  submit(): void {
    if (!this.questionText.trim()) return;

    const selectedTech = this.selectedTech.map(t => t.trim()).filter(Boolean);
    const techTag = selectedTech[0] ?? 'General';
    const techAsHashtags = selectedTech.slice(1).map(t => (t.startsWith('#') ? t : `#${t}`));
    const hashtags = [
      ...this.selectedHashtags.map(h => h.trim()).filter(Boolean).map(h => (h.startsWith('#') ? h : `#${h}`)),
      ...techAsHashtags,
    ];
    const uniqueHashtags = Array.from(new Set(hashtags));

    this.qs.post({
      title: this.questionText,
      techTag,
      hashtags: uniqueHashtags,
    });
    this.questionText = '';
    this.selectedTech = [];
    this.suggestedTech = [];
    this.techTouched = false;
    this.hashtagQuery = '';
    this.selectedHashtags = [];
    this.close.emit();
  }

  filteredHashtags(): string[] {
    const options = this.tagOptions.tags();
    const q = this.hashtagQuery.toLowerCase().trim();
    const base = q ? options.filter(t => t.toLowerCase().includes(q)) : options.slice(0, 12);
    return base.filter(t => !this.selectedHashtags.includes(t)).slice(0, 16);
  }

  toggleTech(tag: string): void {
    this.techTouched = true;
    if (this.selectedTech.includes(tag)) {
      this.selectedTech = this.selectedTech.filter(t => t !== tag);
    } else {
      this.selectedTech = [...this.selectedTech, tag];
    }
  }

  addHashtag(tag: string): void {
    if (!this.selectedHashtags.includes(tag)) this.selectedHashtags = [...this.selectedHashtags, tag];
    this.hashtagQuery = '';
    this.hashtagOpen = true;
  }

  removeHashtag(tag: string): void {
    this.selectedHashtags = this.selectedHashtags.filter(t => t !== tag);
  }

  private computeSuggestions(): void {
    const tags = this.tagOptions.tags();
    const qText = this.questionText.toLowerCase().trim();
    if (!qText) {
      this.suggestedTech = [];
      if (!this.techTouched) this.selectedTech = [];
      return;
    }

    if (!tags.length) {
      this.suggestedTech = [];
      return;
    }

    const words = qText
      .split(/[^a-z0-9+.#-]+/g)
      .map(w => w.trim())
      .filter(w => w.length >= 2);
    const wordSet = new Set(words);

    const scored = tags
      .map((tag) => {
        const t = tag.toLowerCase();
        let score = 0;
        if (qText.includes(t)) score += 10;
        const parts = t.split(/[-.]+/g).filter(Boolean);
        for (const p of parts) {
          if (wordSet.has(p)) score += 2;
        }
        for (const w of words) {
          if (w.length >= 3 && t.includes(w)) score += 1;
        }
        return score > 0 ? { tag, score } : null;
      })
      .filter(Boolean) as Array<{ tag: string; score: number }>;

    scored.sort((a, b) => b.score - a.score);
    const suggestions = scored.slice(0, 10).map(s => s.tag);
    this.suggestedTech = suggestions;

    if (!this.techTouched && !this.selectedTech.length && suggestions.length) {
      this.selectedTech = suggestions.slice(0, 3);
    }
  }
}
