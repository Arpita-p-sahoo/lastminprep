import { Component, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.css'],
})
export class BottomNavComponent {
  postClick = output<void>();
}
