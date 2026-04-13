import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { SeoService } from './core/services/seo.service';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.themeService.init();
    this.seoService.init();
  }
}
