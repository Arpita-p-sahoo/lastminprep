import { Component, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { QuestionCardComponent } from '../../shared/components/question-card.component';
import { AuthService } from '../../core/services/auth.service';
import { QuestionService } from '../../core/services/question.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, QuestionCardComponent, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  auth = inject(AuthService);
  qs = inject(QuestionService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  activeChip = 'All';
  chips = ['All', 'Angular', 'Node.js', 'React', 'System Design', 'DevOps'];
  trending = [
    { name: '#AngularSignals', count: 284 },
    { name: '#SystemDesign', count: 201 },
    { name: '#NodeJS', count: 176 },
    { name: '#ReactHooks', count: 154 },
    { name: '#Docker', count: 98 },
  ];
  latestJobs = [
    { title: 'Senior Angular Developer', company: 'Razorpay', loc: 'Remote', stack: ['Angular', 'TypeScript'] },
    { title: 'Full Stack Engineer', company: 'Groww', loc: 'Hybrid', stack: ['Node.js', 'React'] },
    { title: 'Frontend Developer', company: 'Zepto', loc: 'Remote', stack: ['React', 'Next.js'] },
  ];

  get firstName(): string {
    const name = this.auth.currentUser()?.name;
    return name?.split(' ')[0] ?? '';
  }
}
