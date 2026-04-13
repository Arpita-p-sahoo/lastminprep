import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  theme = inject(ThemeService);
  auth = inject(AuthService);
  trending = [
    { tech: 'Angular', hash: '#signals', title: 'What is the difference between Angular Signals and NgRx?', votes: 284, comments: 42, hot: true, isNew: false },
    { tech: 'Node.js', hash: '#eventloop', title: 'Explain the Node.js event loop and how it handles async ops.', votes: 201, comments: 38, hot: false, isNew: false },
    { tech: 'System Design', hash: '', title: 'Design a URL shortener like Bitly. Walk through the architecture.', votes: 176, comments: 27, hot: false, isNew: true },
  ];
}
