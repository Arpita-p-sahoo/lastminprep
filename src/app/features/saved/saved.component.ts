import { Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { QuestionService } from '../../core/services/question.service';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent],
  templateUrl: './saved.component.html',
  styles: [],
})
export class SavedComponent {
  qs = inject(QuestionService);
  d = signal(false); p = signal(false);
  saved = () => this.qs.getSaved();
}
