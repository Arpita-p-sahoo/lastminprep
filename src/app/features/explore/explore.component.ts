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
    { id: 'frontend', name: 'Frontend', icon: '🌐', count: 3840, frameworks: [{ name: 'Angular', icon: '🅰️', count: 980, domain: 'frontend' }, { name: 'React', icon: '⚛️', count: 1240, domain: 'frontend' }, { name: 'Vue', icon: '💚', count: 620, domain: 'frontend' }, { name: 'Next.js', icon: '▲', count: 540, domain: 'frontend' }, { name: 'Svelte', icon: '🔥', count: 180, domain: 'frontend' }, { name: 'Nuxt', icon: '🌿', count: 280, domain: 'frontend' }] },
    { id: 'backend', name: 'Backend', icon: '⚙️', count: 2910, frameworks: [{ name: 'Node.js', icon: '🟢', count: 840, domain: 'backend' }, { name: 'NestJS', icon: '🐈', count: 420, domain: 'backend' }, { name: 'Django', icon: '🐍', count: 380, domain: 'backend' }, { name: 'FastAPI', icon: '⚡', count: 310, domain: 'backend' }, { name: 'Spring', icon: '🍃', count: 290, domain: 'backend' }, { name: 'Express', icon: '🚂', count: 670, domain: 'backend' }] },
    { id: 'mobile', name: 'Mobile', icon: '📱', count: 1240, frameworks: [{ name: 'Flutter', icon: '🐦', count: 480, domain: 'mobile' }, { name: 'React Native', icon: '📱', count: 420, domain: 'mobile' }, { name: 'Swift', icon: '🍎', count: 220, domain: 'mobile' }, { name: 'Kotlin', icon: '🤖', count: 120, domain: 'mobile' }] },
    { id: 'devops', name: 'DevOps', icon: '🚀', count: 980, frameworks: [{ name: 'Docker', icon: '🐳', count: 310, domain: 'devops' }, { name: 'Kubernetes', icon: '⚓', count: 240, domain: 'devops' }, { name: 'AWS', icon: '☁️', count: 280, domain: 'devops' }, { name: 'Terraform', icon: '🏗️', count: 150, domain: 'devops' }] },
    { id: 'datascience', name: 'Data Science', icon: '📊', count: 1560, frameworks: [{ name: 'Python', icon: '🐍', count: 480, domain: 'datascience' }, { name: 'TensorFlow', icon: '🧠', count: 320, domain: 'datascience' }, { name: 'PyTorch', icon: '🔥', count: 280, domain: 'datascience' }, { name: 'Pandas', icon: '🐼', count: 480, domain: 'datascience' }] },
    { id: 'system', name: 'System Design', icon: '🏗️', count: 740, frameworks: [{ name: 'Microservices', icon: '🏗️', count: 240, domain: 'system' }, { name: 'Databases', icon: '🗄️', count: 310, domain: 'system' }, { name: 'Caching', icon: '⚡', count: 180, domain: 'system' }, { name: 'API Design', icon: '🔌', count: 210, domain: 'system' }] },
  ];

  selectDomain(d: DomainConfig): void { this.selectedDomain = d; this.selectedFw = null; }
  selectFw(name: string): void {
    this.selectedFw = name;
    setTimeout(() => this.router.navigate(['/feed']), 350);
  }
}
