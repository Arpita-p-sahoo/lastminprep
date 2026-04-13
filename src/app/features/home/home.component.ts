import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { QuestionService } from '../../core/services/question.service';

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
  qs = inject(QuestionService);
  router = inject(Router);

  go(url: string, requiresAuth = false): void {
    if (requiresAuth && !this.auth.isLoggedIn()) {
      this.router.navigateByUrl('/signup');
      return;
    }
    this.router.navigateByUrl(url);
  }

  trending = () => {
    const list = [...this.qs.questions()];
    list.sort((a, b) => {
      const dv = (b.votes ?? 0) - (a.votes ?? 0);
      if (dv !== 0) return dv;
      const dc = (b.commentCount ?? 0) - (a.commentCount ?? 0);
      if (dc !== 0) return dc;
      return (b.createdAt?.getTime?.() ?? 0) - (a.createdAt?.getTime?.() ?? 0);
    });
    return list.slice(0, 6).map(q => ({
      id: q.id,
      title: q.title,
      tech: q.techTag,
      hash: q.hashtags?.[0] ?? '',
      votes: q.votes ?? 0,
      comments: q.commentCount ?? 0,
      hot: !!q.isHot,
      isNew: !!q.isNew,
    }));
  };
}
