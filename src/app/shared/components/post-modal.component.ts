import { Component, ElementRef, ViewChild, effect, inject, input, output, signal } from '@angular/core';
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

  @ViewChild('hashtagWrap') hashtagWrap?: ElementRef<HTMLElement>;

  questionText = '';
  selectedTech = [] as string[];
  suggestedTech = [] as string[];
  techMoreOpen = false;
  techTouched = false;
  suggestTimer: any = null;

  hashtagQuery = '';
  hashtagOpen = false;
  selectedHashtags = [] as string[];
  posting = signal(false);

  constructor() {
    effect(() => {
      if (this.open()) {
        this.tagOptions.ensureLoaded();
        this.computeSuggestions();
      }
    }, { allowSignalWrites: true });
    effect(() => {
      const isOpen = this.open();
      const tagsCount = this.tagOptions.tags().length;
      if (isOpen && tagsCount) this.computeSuggestions();
    });
  }

  onOverlayClick(e: MouseEvent): void {
    if (this.posting()) return;
    if ((e.target as HTMLElement).classList.contains('modal-overlay')) this.close.emit();
  }

  onModalBoxClick(e: MouseEvent): void {
    e.stopPropagation();
    if (!this.hashtagOpen) return;
    const target = e.target as Node | null;
    const wrap = this.hashtagWrap?.nativeElement;
    if (!target || !wrap) return;
    if (!wrap.contains(target)) this.hashtagOpen = false;
  }

  onQuestionInput(): void {
    if (this.suggestTimer) clearTimeout(this.suggestTimer);
    this.suggestTimer = setTimeout(() => this.computeSuggestions(), 250);
  }

  submit(): void {
    if (!this.questionText.trim() || this.posting()) return;

    const selectedTech = this.selectedTech.map(t => t.trim()).filter(Boolean);
    const techTag = selectedTech[0] ?? 'General';
    const techHashtag = techTag !== 'General' ? this.normalizeHashtag(techTag) : '';
    const selectedHashtags = this.selectedHashtags.map(h => this.normalizeHashtag(h)).filter(Boolean);
    const extraTechHashtags = selectedTech.slice(1).map(t => this.normalizeHashtag(t)).filter(Boolean);
    const uniqueHashtags = Array.from(new Set([techHashtag, ...selectedHashtags, ...extraTechHashtags].filter(Boolean)));

    this.posting.set(true);
    this.qs
      .post({
        title: this.questionText,
        techTag,
        hashtags: uniqueHashtags,
      })
      .subscribe({
        next: () => {
          this.posting.set(false);
          this.questionText = '';
          this.selectedTech = [];
          this.suggestedTech = [];
          this.techMoreOpen = false;
          this.techTouched = false;
          this.hashtagQuery = '';
          this.selectedHashtags = [];
          this.close.emit();
        },
        // Keep the modal open with the user's input intact on failure — the
        // service already surfaces a toast, so just stop the loader and let
        // them retry instead of silently discarding what they wrote.
        error: () => this.posting.set(false),
      });
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

  toggleMoreTech(): void {
    this.techMoreOpen = !this.techMoreOpen;
  }

  techOptionsToShow(): string[] {
    const base = this.suggestedTech.length ? this.suggestedTech : this.tagOptions.tags();
    const options = base.filter(t => !this.selectedTech.includes(t));
    return options.slice(0, this.techMoreOpen ? 24 : 8);
  }

  showMoreTechButton(): boolean {
    const base = this.suggestedTech.length ? this.suggestedTech : this.tagOptions.tags();
    const options = base.filter(t => !this.selectedTech.includes(t));
    return options.length > (this.techMoreOpen ? 24 : 8);
  }

  addHashtag(tag: string): void {
    if (!this.selectedHashtags.includes(tag)) this.selectedHashtags = [...this.selectedHashtags, tag];
    this.hashtagQuery = '';
    this.hashtagOpen = false;
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

  private normalizeHashtag(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const noHash = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
    return noHash
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_+.-]/g, '')
      .trim();
  }
}
