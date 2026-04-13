import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { DomainConfig } from '../../core/models';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css'],
})
export class ExploreComponent {
  router = inject(Router);
  drawerOpen = signal(false);
  postOpen = signal(false);
  selectedDomain: DomainConfig | null = null;
  selectedFw: string | null = null;

  domains: DomainConfig[] = [
    { id: 'frontend', name: 'Frontend', icon: 'public', count: 3840, frameworks: [{ name: 'Angular', icon: 'integration_instructions', count: 980, domain: 'frontend' }, { name: 'React', icon: 'data_object', count: 1240, domain: 'frontend' }, { name: 'Vue', icon: 'view_in_ar', count: 620, domain: 'frontend' }, { name: 'Next.js', icon: 'open_in_new', count: 540, domain: 'frontend' }, { name: 'Svelte', icon: 'bolt', count: 180, domain: 'frontend' }, { name: 'Nuxt', icon: 'auto_awesome', count: 280, domain: 'frontend' }] },
    { id: 'backend', name: 'Backend', icon: 'dns', count: 2910, frameworks: [{ name: 'Node.js', icon: 'terminal', count: 840, domain: 'backend' }, { name: 'NestJS', icon: 'account_tree', count: 420, domain: 'backend' }, { name: 'Django', icon: 'language', count: 380, domain: 'backend' }, { name: 'FastAPI', icon: 'speed', count: 310, domain: 'backend' }, { name: 'Spring', icon: 'eco', count: 290, domain: 'backend' }, { name: 'Express', icon: 'route', count: 670, domain: 'backend' }] },
    { id: 'mobile', name: 'Mobile', icon: 'smartphone', count: 1240, frameworks: [{ name: 'Flutter', icon: 'flutter_dash', count: 480, domain: 'mobile' }, { name: 'React Native', icon: 'mobile_friendly', count: 420, domain: 'mobile' }, { name: 'Swift', icon: 'developer_mode', count: 220, domain: 'mobile' }, { name: 'Kotlin', icon: 'android', count: 120, domain: 'mobile' }] },
    { id: 'devops', name: 'DevOps', icon: 'cloud', count: 980, frameworks: [{ name: 'Docker', icon: 'inventory_2', count: 310, domain: 'devops' }, { name: 'Kubernetes', icon: 'hub', count: 240, domain: 'devops' }, { name: 'AWS', icon: 'cloud_queue', count: 280, domain: 'devops' }, { name: 'Terraform', icon: 'build', count: 150, domain: 'devops' }] },
    { id: 'datascience', name: 'Data Science', icon: 'analytics', count: 1560, frameworks: [{ name: 'Python', icon: 'terminal', count: 480, domain: 'datascience' }, { name: 'TensorFlow', icon: 'memory', count: 320, domain: 'datascience' }, { name: 'PyTorch', icon: 'bolt', count: 280, domain: 'datascience' }, { name: 'Pandas', icon: 'table_chart', count: 480, domain: 'datascience' }] },
    { id: 'system', name: 'System Design', icon: 'architecture', count: 740, frameworks: [{ name: 'Microservices', icon: 'account_tree', count: 240, domain: 'system' }, { name: 'Databases', icon: 'storage', count: 310, domain: 'system' }, { name: 'Caching', icon: 'cached', count: 180, domain: 'system' }, { name: 'API Design', icon: 'api', count: 210, domain: 'system' }] },
  ];

  selectDomain(d: DomainConfig): void { this.selectedDomain = d; this.selectedFw = null; }
  selectFw(name: string): void {
    this.selectedFw = name;
    setTimeout(() => this.router.navigate(['/feed']), 350);
  }
}
