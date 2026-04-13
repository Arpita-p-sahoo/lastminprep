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
  leaderboard: any[] = [];
  badges: { icon: string; name: string; desc: string }[] = [];
}
