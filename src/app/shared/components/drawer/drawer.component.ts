import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { JobService } from '../../../core/services/job.service';
import { QuestionService } from '../../../core/services/question.service';

@Component({
  selector: 'app-drawer',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.css'],
})
export class DrawerComponent {
  open = input<boolean>(false);
  close = output<void>();
  auth = inject(AuthService);
  jobs = inject(JobService);
  qs = inject(QuestionService);
}
