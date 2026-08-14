import { Injectable } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { filter, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private title: Title,
    private meta: Meta
  ) {}

  init(): void {
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) route = route.firstChild;
          return route.snapshot.data;
        })
      )
      .subscribe((data) => {
        const pageTitle = data['title'] || 'LastMinPrep';
        const description = data['description'] || 'Community-curated interview questions sorted by tech stack.';
        const ogImage = data['ogImage'] || 'https://lastminprep-omega.vercel.app/assets/og-image.png';
        const url = this.router.url;

        this.title.setTitle(pageTitle);

        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ property: 'og:title', content: pageTitle });
        this.meta.updateTag({ property: 'og:description', content: description });
        this.meta.updateTag({ property: 'og:image', content: ogImage });
        this.meta.updateTag({ property: 'og:url', content: `https://lastminprep-omega.vercel.app${url}` });
        this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
        this.meta.updateTag({ name: 'twitter:description', content: description });
        this.meta.updateTag({ name: 'twitter:image', content: ogImage });
      });
  }
}
