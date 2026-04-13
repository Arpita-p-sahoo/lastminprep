import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { TitleStrategy } from '@angular/router';
import { LmpTitleStrategy } from './core/services/title-strategy.service';
import { authInterceptor } from './core/interceptors/auth.interceptor';

const viewTransitionsSupported =
  typeof document !== 'undefined' &&
  typeof (document as any).startViewTransition === 'function';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    viewTransitionsSupported
      ? provideRouter(routes, withViewTransitions(), withComponentInputBinding())
      : provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideAnimations(),
    { provide: TitleStrategy, useClass: LmpTitleStrategy },
  ],
};
