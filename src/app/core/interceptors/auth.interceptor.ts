import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, tap, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const token = localStorage.getItem('lmp_token');
    const shouldAttachToken = !!token && req.url.startsWith(environment.apiUrl);
    const authReq = shouldAttachToken ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
    const router = inject(Router);
    const toast = inject(ToastService);
    const shouldLog = !environment.production && authReq.url.startsWith(environment.apiUrl);
    const requestId = Math.random().toString(16).slice(2, 8);
    const startedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();

    const redactionKeys = new Set(['password', 'pass', 'token', 'accessToken', 'refreshToken', 'authorization']);
    const redact = (input: any): any => {
        const seen = new WeakSet<object>();
        const walk = (value: any): any => {
            if (value === null || value === undefined) return value;
            if (typeof value !== 'object') return value;
            if (value instanceof Date) return value.toISOString();
            if (value instanceof Blob) return { type: value.type, size: value.size };
            if (typeof FormData !== 'undefined' && value instanceof FormData) {
                const keys: string[] = [];
                value.forEach((_, k) => keys.push(k));
                return { formDataKeys: Array.from(new Set(keys)) };
            }
            if (Array.isArray(value)) return value.map(v => walk(v));
            if (seen.has(value)) return '[Circular]';
            seen.add(value);
            const out: Record<string, any> = {};
            for (const [k, v] of Object.entries(value)) {
                if (redactionKeys.has(k)) out[k] = '[REDACTED]';
                else out[k] = walk(v);
            }
            return out;
        };
        return walk(input);
    };

    const safeHeaders = (): Record<string, string> => {
        const out: Record<string, string> = {};
        for (const k of authReq.headers.keys()) {
            if (k.toLowerCase() === 'authorization') continue;
            const v = authReq.headers.get(k);
            if (v != null) out[k] = v;
        }
        return out;
    };

    if (shouldLog) {
        console.groupCollapsed(`[HTTP OUT ${requestId}] ${authReq.method} ${authReq.url}`);
        console.log('headers', safeHeaders());
        if (authReq.params?.keys()?.length) console.log('params', authReq.params.keys().reduce((acc: any, k: string) => ({ ...acc, [k]: authReq.params.get(k) }), {}));
        if (authReq.body !== null && authReq.body !== undefined) console.log('body', redact(authReq.body));
        console.groupEnd();
    }

    return next(authReq).pipe(
        tap(event => {
            if (!shouldLog) return;
            if (!(event instanceof HttpResponse)) return;
            const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
            const ms = Math.round((endedAt - startedAt) * 10) / 10;
            console.groupCollapsed(`[HTTP IN  ${requestId}] ${event.status} ${authReq.method} ${authReq.url} (${ms}ms)`);
            console.log('body', redact(event.body));
            console.groupEnd();
        }),
        catchError((err: HttpErrorResponse) => {
            const isAuthCall =
                authReq.url.includes('/auth/login') ||
                authReq.url.includes('/auth/signup') ||
                authReq.url.includes('/auth/register');

            if (shouldLog) {
                const endedAt = typeof performance !== 'undefined' ? performance.now() : Date.now();
                const ms = Math.round((endedAt - startedAt) * 10) / 10;
                console.groupCollapsed(
                    `[HTTP ERR ${requestId}] ${err.status || 0} ${authReq.method} ${authReq.url} (${ms}ms)`
                );
                console.log('message', err.message);
                if (err.error !== null && err.error !== undefined) console.log('error', redact(err.error));
                console.groupEnd();
            }

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
