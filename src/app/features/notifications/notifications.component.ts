import { Component, computed, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';

type NotifItem = {
  id: string;
  section: string;
  icon: string;
  iconClass: string;
  tag: string;
  tagClass: string;
  title: string;
  subtitle: string;
  example: string;
};

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

  items: NotifItem[] = [
    {
      id: 'q-vote',
      section: 'QUESTION NOTIFICATIONS',
      icon: 'arrow_upward',
      iconClass: 'vote',
      tag: 'Vote',
      tagClass: 'vote',
      title: 'Someone voted on your question',
      subtitle: 'When any user upvotes a question you posted.',
      example: 'Rahul Dev voted on your question — "What is the difference between Angular Signals and NgRx?"',
    },
    {
      id: 'q-comment',
      section: 'QUESTION NOTIFICATIONS',
      icon: 'chat_bubble',
      iconClass: 'comment',
      tag: 'Comment',
      tagClass: 'comment',
      title: 'Someone commented on your question',
      subtitle: 'When any user adds a comment to a question you posted.',
      example: 'Sneha commented on your question — "REST is simpler but GraphQL gives you exactly what you ask for"',
    },
    {
      id: 'q-save',
      section: 'QUESTION NOTIFICATIONS',
      icon: 'bookmark',
      iconClass: 'save',
      tag: 'Save',
      tagClass: 'save',
      title: 'Someone saved your question',
      subtitle: 'When a user bookmarks your question to their saved list.',
      example: 'Amit saved your question — "How do you optimize PostgreSQL queries in NestJS?"',
    },
    {
      id: 'c-like',
      section: 'COMMENT NOTIFICATIONS',
      icon: 'thumb_up',
      iconClass: 'like',
      tag: 'Like',
      tagClass: 'like',
      title: 'Someone liked your comment',
      subtitle: 'When a user likes a comment you wrote.',
      example: 'Rahul liked your comment — "Signals simplify reactive state without boilerplate"',
    },
    {
      id: 'sys-trending',
      section: 'SYSTEM NOTIFICATIONS',
      icon: 'notifications',
      iconClass: 'system',
      tag: 'System',
      tagClass: 'system',
      title: 'Your question is trending',
      subtitle: 'When your question crosses 50 votes and gets marked as Hot.',
      example: 'Your question is trending! — "What is the difference between Angular Signals and NgRx? has 50+ votes"',
    },
    {
      id: 'sys-welcome',
      section: 'SYSTEM NOTIFICATIONS',
      icon: 'check_circle',
      iconClass: 'system-ok',
      tag: 'System',
      tagClass: 'system',
      title: 'Welcome to LastMinPrep',
      subtitle: 'Sent automatically when a new user signs up.',
      example: 'Welcome Ankita! Start by posting your first interview question and connecting with the community.',
    },
  ];

  sections = computed(() => {
    const out: Array<{ title: string; items: NotifItem[] }> = [];
    for (const it of this.items) {
      const found = out.find(s => s.title === it.section);
      if (found) found.items.push(it);
      else out.push({ title: it.section, items: [it] });
    }
    return out;
  });
}
