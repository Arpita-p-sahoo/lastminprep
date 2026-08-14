import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { SeoService } from './core/services/seo.service';
import { AuthService } from './core/services/auth.service';
import { ToastContainerComponent } from './shared/components/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private seoService: SeoService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.themeService.init();
    this.seoService.init();
  }
}
