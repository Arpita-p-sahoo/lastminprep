import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionService } from '../../core/services/question.service';
import { AuthService } from '../../core/services/auth.service';
import { Question } from '../../core/models';

@Component({
  selector: 'app-my-questions',
  standalone: true,
  imports: [RouterLink, NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
  templateUrl: './my-questions.component.html',
  styleUrls: ['./my-questions.component.css'],
})
export class MyQuestionsComponent {
  qs = inject(QuestionService);
  auth = inject(AuthService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  myQ = () => {
    const userId = this.auth.currentUser()?.id ?? '';
    return this.qs.getByAuthor(userId);
  };
  totalVotes = () => this.myQ().reduce((s, q) => s + q.votes, 0);
}
