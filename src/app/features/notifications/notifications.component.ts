import { Component, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { Notification } from '../../core/models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css'],
})
export class NotificationsComponent {
  drawerOpen = signal(false);
  postOpen = signal(false);
  notifications: Notification[] = [
    { id: '1', icon: '👍', text: '<b>@rahul_dev</b> upvoted your question on TypeScript generics.', time: '2 minutes ago', isRead: false },
    { id: '2', icon: '💬', text: '<b>@sneha_backend</b> commented on your Angular RxJS question.', time: '1 hour ago', isRead: false },
    { id: '3', icon: '🏆', text: 'Your question ranked <b>#1 in Angular</b> this week!', time: '3 hours ago', isRead: false },
    { id: '4', icon: '💼', text: '<b>Razorpay</b> posted a new Angular developer role matching your profile.', time: 'Yesterday', isRead: true },
    { id: '5', icon: '👤', text: '<b>@priya_sde</b> started following you.', time: '2 days ago', isRead: true },
    { id: '6', icon: '⭐', text: 'Your question on TypeScript generics was saved by <b>28 developers</b>.', time: '3 days ago', isRead: true },
  ];
  unread = () => this.notifications.filter(n => !n.isRead).length;
}
