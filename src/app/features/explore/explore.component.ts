import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { DomainConfig } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent],
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

  domains: DomainConfig[] = [
    {
      id: 'frontend',
      name: 'Frontend',
      icon: 'html5',
      count: 3840,
      frameworks: [
        { name: 'Angular', icon: 'angular', count: 980, domain: 'frontend' },
        { name: 'React', icon: 'react', count: 1240, domain: 'frontend' },
        { name: 'Vue', icon: 'vuedotjs', count: 620, domain: 'frontend' },
        { name: 'Next.js', icon: 'nextdotjs', count: 540, domain: 'frontend' },
        { name: 'Svelte', icon: 'svelte', count: 180, domain: 'frontend' },
        { name: 'Nuxt', icon: 'nuxtdotjs', count: 280, domain: 'frontend' },
      ],
    },
    {
      id: 'backend',
      name: 'Backend',
      icon: 'nodedotjs',
      count: 2910,
      frameworks: [
        { name: 'Node.js', icon: 'nodedotjs', count: 840, domain: 'backend' },
        { name: 'NestJS', icon: 'nestjs', count: 420, domain: 'backend' },
        { name: 'Django', icon: 'django', count: 380, domain: 'backend' },
        { name: 'FastAPI', icon: 'fastapi', count: 310, domain: 'backend' },
        { name: 'Spring', icon: 'spring', count: 290, domain: 'backend' },
        { name: 'Express', icon: 'express', count: 670, domain: 'backend' },
      ],
    },
    {
      id: 'mobile',
      name: 'Mobile',
      icon: 'android',
      count: 1240,
      frameworks: [
        { name: 'Flutter', icon: 'flutter', count: 480, domain: 'mobile' },
        { name: 'React Native', icon: 'react', count: 420, domain: 'mobile' },
        { name: 'Swift', icon: 'swift', count: 220, domain: 'mobile' },
        { name: 'Kotlin', icon: 'kotlin', count: 120, domain: 'mobile' },
      ],
    },
    {
      id: 'devops',
      name: 'DevOps',
      icon: 'docker',
      count: 980,
      frameworks: [
        { name: 'Docker', icon: 'docker', count: 310, domain: 'devops' },
        { name: 'Kubernetes', icon: 'kubernetes', count: 240, domain: 'devops' },
        { name: 'AWS', icon: 'amazonaws', count: 280, domain: 'devops' },
        { name: 'Terraform', icon: 'terraform', count: 150, domain: 'devops' },
      ],
    },
    {
      id: 'datascience',
      name: 'Data Science',
      icon: 'python',
      count: 1560,
      frameworks: [
        { name: 'Python', icon: 'python', count: 480, domain: 'datascience' },
        { name: 'TensorFlow', icon: 'tensorflow', count: 320, domain: 'datascience' },
        { name: 'PyTorch', icon: 'pytorch', count: 280, domain: 'datascience' },
        { name: 'Pandas', icon: 'pandas', count: 480, domain: 'datascience' },
      ],
    },
    {
      id: 'ai',
      name: 'AI',
      icon: 'openai',
      count: 1420,
      frameworks: [
        { name: 'LLMs', icon: 'openai', count: 520, domain: 'ai' },
        { name: 'Hugging Face', icon: 'huggingface', count: 340, domain: 'ai' },
        { name: 'Prompt Engineering', icon: '', count: 260, domain: 'ai' },
        { name: 'RAG', icon: '', count: 300, domain: 'ai' },
      ],
    },
    {
      id: 'system',
      name: 'System Design',
      icon: 'kubernetes',
      count: 740,
      frameworks: [
        { name: 'Microservices', icon: '', count: 240, domain: 'system' },
        { name: 'Databases', icon: 'postgresql', count: 310, domain: 'system' },
        { name: 'Caching', icon: 'redis', count: 180, domain: 'system' },
        { name: 'API Design', icon: '', count: 210, domain: 'system' },
      ],
    },
  ];

  selectDomain(d: DomainConfig): void { this.selectedDomain = d; this.selectedFw = null; }
  selectFw(name: string): void {
    this.selectedFw = name;
    setTimeout(() => this.router.navigate(['/feed']), 350);
  }
}
