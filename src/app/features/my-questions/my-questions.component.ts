import { Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionService } from '../../core/services/question.service';
import { Question } from '../../core/models';

@Component({
  selector: 'app-my-questions',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
  templateUrl: './my-questions.component.html',
  styleUrls: ['./my-questions.component.css'],
})
export class MyQuestionsComponent {
  qs = inject(QuestionService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  myQ = () => this.qs.getByAuthor('1');
  totalVotes = () => this.myQ().reduce((s, q) => s + q.votes, 0);
}
