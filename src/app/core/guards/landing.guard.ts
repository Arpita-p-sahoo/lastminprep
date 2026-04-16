import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environment';

export const landingGuard: CanActivateFn = () => {
  const router = inject(Router);
  const http = inject(HttpClient);

  const token = String(localStorage.getItem('lmp_token') || '').trim();
  if (!token) return true;

  return http.get<any>(`${environment.apiUrl}/users/me`).pipe(
    map((): UrlTree => router.createUrlTree(['/dashboard'])),
    catchError((err: any) => {
      if (err?.status === 401 || err?.status === 403) {
        localStorage.removeItem('lmp_user');
        localStorage.removeItem('lmp_token');
        return of(router.createUrlTree(['/login']));
      }
      return of(router.createUrlTree(['/dashboard']));
    })
  );
};

