import { Component, signal, inject } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { AuthService } from '../../core/services/auth.service';
import { LeaderboardService } from '../../core/services/leaderboard.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.css'],
})
export class LeaderboardComponent {
  auth = inject(AuthService);
  lb = inject(LeaderboardService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  period = 'This week';
  badges: { icon: string; name: string; desc: string }[] = [];

  constructor() {
    this.lb.load();
  }

  myRank(): number | null {
    const mine = this.lb.entries().find(e => e.isCurrentUser);
    return mine ? mine.rank : null;
  }
}
