import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('lmp_token');
    const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    const router = inject(Router);
    const toast = inject(ToastService);

    return next(authReq).pipe(
        catchError((err: HttpErrorResponse) => {
            const isAuthCall =
                authReq.url.includes('/auth/login') ||
                authReq.url.includes('/auth/signup') ||
                authReq.url.includes('/auth/register');

            if (err.status === 401 && !isAuthCall) {
                localStorage.removeItem('lmp_user');
                localStorage.removeItem('lmp_token');
                toast.info('Session expired. Please login again.');
                router.navigate(['/login']);
            }

            return throwError(() => err);
        })
    );
};
