import { AfterViewInit, Component, ElementRef, OnDestroy, inject, input, output, signal } from '@angular/core';

/**
 * Floating "scroll to top" button, fixed to the viewport (so it never scrolls
 * away with the list) but horizontally aligned to sit over the `.content`
 * list column itself rather than the far edge of the screen — which would
 * otherwise land on top of a right-hand `.rpanel`.
 *
 * Optionally pairs it with a second action button whose icon, label and
 * click behavior are supplied by the host page — each list page's primary
 * "create/act on this" action (post a question, post a job, edit profile,
 * follow a user, ...) rather than one generic action everywhere. Omit
 * `actionIcon` (leave `showAction` false, the default) on pages with no such
 * action, e.g. Search, Notifications, Leaderboard.
 *
 * Drop this as a sibling of `.content` inside `.main-layout` — it locates
 * the scrollable `.content` element itself, so no wiring beyond `(action)`
 * is needed.
 */
@Component({
  selector: 'app-scroll-fab',
  standalone: true,
  templateUrl: './scroll-fab.component.html',
  styleUrls: ['./scroll-fab.component.css'],
})
export class ScrollFabComponent implements AfterViewInit, OnDestroy {
  showAction = input(false);
  actionIcon = input('add');
  actionLabel = input('Add');
  // Set true only when the action duplicates the bottom nav's own Post
  // button on mobile (e.g. "post a question") — pages whose action has no
  // mobile equivalent (post a job, edit profile, follow) should leave this
  // false so mobile users keep access to it too.
  hideActionOnMobile = input(false);
  action = output<void>();

  showTop = signal(false);

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private scrollTarget: HTMLElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private readonly onScroll = () => {
    this.showTop.set((this.scrollTarget?.scrollTop ?? 0) > 300);
  };

  // Fixed positioning is relative to the viewport, not `.content`, so its
  // horizontal offset has to be measured in JS to line up with the list
  // column's own right edge instead of the window's.
  private readonly reposition = () => {
    const target = this.scrollTarget;
    if (!target) return;
    const rightGap = Math.max(0, window.innerWidth - target.getBoundingClientRect().right);
    this.hostEl.nativeElement.style.setProperty('--fab-right', `${rightGap + 24}px`);
  };

  ngAfterViewInit(): void {
    const parent = this.hostEl.nativeElement.parentElement;
    const found = parent ? parent.querySelector('.content') : null;
    this.scrollTarget = found instanceof HTMLElement ? found : null;
    if (!this.scrollTarget) return;

    this.scrollTarget.addEventListener('scroll', this.onScroll, { passive: true });
    this.reposition();
    this.resizeObserver = new ResizeObserver(this.reposition);
    this.resizeObserver.observe(this.scrollTarget);
    window.addEventListener('resize', this.reposition);
  }

  ngOnDestroy(): void {
    this.scrollTarget?.removeEventListener('scroll', this.onScroll);
    this.resizeObserver?.disconnect();
    window.removeEventListener('resize', this.reposition);
  }

  scrollToTop(): void {
    this.scrollTarget?.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
