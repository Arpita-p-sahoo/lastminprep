import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionService } from '../../core/services/question.service';
import { Question } from '../../core/models';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  qs = inject(QuestionService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  query = '';
  results = signal<Question[]>([]);
  popularTags: string[] = [];
  recentResults: { title: string; tech: string; votes: number; author: string }[] = [];
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
}
