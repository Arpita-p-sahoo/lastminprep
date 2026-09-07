import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { DomainConfig, Framework } from '../../core/models';
import { TECH_DOMAINS } from '../../core/data/tech-domains';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, FormsModule],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent {
  router = inject(Router);
  auth = inject(AuthService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  selectedDomain: DomainConfig | null = null;
  selectedFw: string | null = null;
  searchQuery = signal('');

  badge(text: string): string {
    const t = String(text ?? '').trim();
    if (!t) return '';
    const domainMap: Record<string, string> = {
      Frontend: 'FE',
      Backend: 'BE',
      Mobile: 'MB',
      DevOps: 'DO',
      'Data Science': 'DS',
      AI: 'AI',
      'System Design': 'SD',
    };
    const mapped = domainMap[t];
    if (mapped) return mapped;

    const parts = t.replace(/[^a-zA-Z0-9.\s]/g, ' ').split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? '';
    const second = (parts[1]?.[0] ?? parts[0]?.[1] ?? '').replace('.', '');
    return (first + second).toUpperCase();
  }

  iconUrl(slug: string | null | undefined, size = 28): string {
    const s = String(slug ?? '').trim().toLowerCase();
    if (!s) return '';
    const safeSize = Number.isFinite(size) ? Math.max(12, Math.min(64, Math.floor(size))) : 28;
    return `https://cdn.simpleicons.org/${encodeURIComponent(s)}?viewbox=auto&size=${safeSize}`;
  }

  domains: DomainConfig[] = TECH_DOMAINS;

  selectDomain(d: DomainConfig): void { this.selectedDomain = d; this.selectedFw = null; }
  selectFw(name: string): void {
    this.selectedFw = name;
    setTimeout(() => this.router.navigate(['/feed'], { queryParams: { tech: name } }), 350);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  filteredDomains(): DomainConfig[] {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.domains;
    return this.domains.filter(
      d => d.name.toLowerCase().includes(q) || d.frameworks.some(fw => fw.name.toLowerCase().includes(q))
    );
  }

  filteredFrameworks(): Framework[] {
    const frameworks = this.selectedDomain?.frameworks ?? [];
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return frameworks;
    return frameworks.filter(fw => fw.name.toLowerCase().includes(q));
  }
}
