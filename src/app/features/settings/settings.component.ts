import { Component, computed, effect, inject, signal } from '@angular/core';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

type NotifPrefItem = {
  id: string;
  label: string;
  description: string;
};

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  compact = signal(false);
  pushEnabled = signal(true);

  notifPrefs = signal<Record<string, boolean>>({});
  notifStorageKey = computed(() => {
    const userId = this.auth.currentUser()?.id ? String(this.auth.currentUser()!.id) : 'guest';
    return `lmp_notif_prefs_${userId}`;
  });

  notifItems: NotifPrefItem[] = [
    { id: 'q-vote', label: 'Votes on your question', description: 'Notify when someone upvotes a question you posted.' },
    { id: 'q-comment', label: 'Comments on your question', description: 'Notify when someone comments on a question you posted.' },
    { id: 'q-save', label: 'Saves on your question', description: 'Notify when someone bookmarks your question.' },
    { id: 'c-like', label: 'Likes on your comment', description: 'Notify when someone likes a comment you wrote.' },
    { id: 'sys-trending', label: 'Trending', description: 'Notify when your question starts trending.' },
    { id: 'sys-updates', label: 'Product updates', description: 'Occasional updates about new features and improvements.' },
  ];

  constructor() {
    effect(
      () => {
        const key = this.notifStorageKey();
        const stored = this.readPrefs(key);
        const base = this.defaultPrefs();
        this.notifPrefs.set({ ...base, ...(stored ?? {}) });
      },
      { allowSignalWrites: true }
    );

    effect(() => {
      const key = this.notifStorageKey();
      const next = this.notifPrefs();
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch { }
    });
  }

  isNotifEnabled(id: string): boolean {
    const key = String(id);
    const v = this.notifPrefs()[key];
    return typeof v === 'boolean' ? v : true;
  }

  toggleNotif(id: string): void {
    const key = String(id);
    if (!key) return;
    this.notifPrefs.update(p => ({ ...p, [key]: !this.isNotifEnabled(key) }));
  }

  private defaultPrefs(): Record<string, boolean> {
    const out: Record<string, boolean> = {};
    for (const it of this.notifItems) out[String(it.id)] = true;
    return out;
  }

  private readPrefs(key: string): Record<string, boolean> | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object') return null;
      const out: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(parsed)) out[String(k)] = !!v;
      return out;
    } catch {
      return null;
    }
  }
}
