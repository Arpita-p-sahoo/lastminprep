import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { ScrollFabComponent } from '../../shared/components/scroll-fab.component';
import { QuestionService } from '../../core/services/question.service';
import { Question } from '../../core/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, ScrollFabComponent, FormsModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  qs = inject(QuestionService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  query = '';
  results = signal<Question[]>([]);
  onSearch(): void {
    if (!this.query.trim()) { this.results.set([]); return; }
    const q = this.query.toLowerCase();
    this.results.set(
      this.qs.questions().filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.techTag.toLowerCase().includes(q) ||
        item.hashtags.some(h => h.toLowerCase().includes(q))
      )
    );
  }

  /** Most-used tech tags / hashtags across all questions, ranked by frequency. */
  popularTags(): string[] {
    const counts = new Map<string, number>();
    for (const q of this.qs.questions()) {
      const tags = [q.techTag, ...(q.hashtags ?? [])].map(t => String(t ?? '').trim()).filter(Boolean);
      for (const t of tags) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }

  /** Latest posted questions, shown before the user has typed a search. */
  recentQuestions(): Question[] {
    return [...this.qs.questions()]
      .sort((a, b) => (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0))
      .slice(0, 6);
  }

  displayText(raw: unknown): string {
    const t = String(raw ?? '');
    const m = t.match(/^\s*```[a-z0-9+-]*\s*\n([\s\S]*?)\n\s*```\s*$/i);
    return m ? m[1] : t;
  }

  isCodeText(raw: unknown): boolean {
    const t = this.displayText(raw);
    const trimmed = t.trim();
    if (!trimmed) return false;

    if (trimmed.includes('```')) return true;

    const hasNewline = /[\r\n]/.test(trimmed);
    const braces = (trimmed.match(/[{}]/g)?.length ?? 0);
    const semicolons = (trimmed.match(/;/g)?.length ?? 0);
    const keywords = /\b(class|public|private|protected|static|void|int|String|System\.out|console\.log|def|function|const|let|var|import|package)\b/.test(
      trimmed
    );

    if (hasNewline && (braces >= 2 || semicolons >= 2)) return true;
    if (braces >= 2 && semicolons >= 1 && keywords) return true;
    if (hasNewline && (/^\s{2,}/m.test(trimmed) || /\t/.test(trimmed))) return true;
    return false;
  }
}
