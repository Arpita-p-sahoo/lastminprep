import { Component, signal, inject } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent {
  auth = inject(AuthService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  period = 'This week';
  leaderboard = [
    { rank: 1, name: '@rahul_dev', questions: 42, votes: 1240, color: '#f59e0b', isCurrentUser: false },
    { rank: 2, name: '@kavya_react', questions: 38, votes: 980, color: '#ec4899', isCurrentUser: false },
    { rank: 3, name: '@priya_sde', questions: 31, votes: 820, color: '#22c55e', isCurrentUser: false },
    { rank: 4, name: '@varun_devops', questions: 27, votes: 640, color: '#3b82f6', isCurrentUser: false },
    { rank: 5, name: '@mohit_dba', questions: 24, votes: 510, color: '#8b5cf6', isCurrentUser: false },
    { rank: 6, name: '@arun_ts', questions: 18, votes: 420, color: '#f59e0b', isCurrentUser: false },
    { rank: 7, name: '@deepa_ml', questions: 15, votes: 350, color: '#06b6d4', isCurrentUser: false },
    { rank: 8, name: '@arpita_sahoo', questions: 12, votes: 284, color: '#5b4ff5', isCurrentUser: true },
  ];
  badges = [
    { icon: '🔥', name: '7-day streak', desc: 'Prepared 7 days in a row' },
    { icon: '⭐', name: 'Top contributor', desc: '100+ votes received' },
    { icon: '🎯', name: 'Sharp shooter', desc: 'First question went viral' },
  ];
}
