import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../shared/components/navbar.component';
import { SidebarComponent } from '../../shared/components/sidebar.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav.component';
import { DrawerComponent } from '../../shared/components/drawer.component';
import { PostModalComponent } from '../../shared/components/post-modal.component';
import { JobService } from '../../core/services/job.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [NavbarComponent, SidebarComponent, BottomNavComponent, DrawerComponent, PostModalComponent, FormsModule],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
})
export class JobsComponent {
  jobService = inject(JobService);
  drawerOpen = signal(false);
  postOpen = signal(false);
  jobModalOpen = signal(false);
  activeFilter = 'All';
  jobForm = { title: '', company: '', location: '', type: 'Remote' as const, experience: '2-5 yrs', techStack: '', salary: '', description: '' };
  postJob(): void {
    this.jobService.post({ ...this.jobForm, techStack: this.jobForm.techStack.split(',').map(s => s.trim()) });
    this.jobModalOpen.set(false);
  }
}
