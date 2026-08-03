import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { JobService } from '../../core/services/job.service';
import { QuestionService } from '../../core/services/question.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements AfterViewInit {
  auth = inject(AuthService);
  jobs = inject(JobService);
  qs = inject(QuestionService);

  @ViewChild('sidebarEl') sidebarEl?: ElementRef<HTMLElement>;
  private readonly destroyRef = inject(DestroyRef);
  private readonly scrollKey = 'lmp_sidebar_scroll';

  ngAfterViewInit(): void {
    const el = this.sidebarEl?.nativeElement;
    if (!el) return;
    if (typeof window === 'undefined') return;

    const restore = () => {
      let y = 0;
      try {
        const raw = window.sessionStorage.getItem(this.scrollKey);
        y = raw ? Number(raw) : 0;
      } catch {
        y = 0;
      }
      if (Number.isFinite(y) && y > 0) el.scrollTop = y;
    };

    restore();
    requestAnimationFrame(restore);

    const onScroll = () => {
      try {
        window.sessionStorage.setItem(this.scrollKey, String(el.scrollTop || 0));
      } catch { }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      onScroll();
      el.removeEventListener('scroll', onScroll);
    });
  }
}
