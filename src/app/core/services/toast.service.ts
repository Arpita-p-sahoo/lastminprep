import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    durationMs: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    toasts = signal<Toast[]>([]);

    success(message: string, durationMs = 3000): void {
        this.show('success', message, durationMs);
    }

    error(message: string, durationMs = 4500): void {
        this.show('error', message, durationMs);
    }

    info(message: string, durationMs = 3000): void {
        this.show('info', message, durationMs);
    }

    dismiss(id: string): void {
        this.toasts.update(list => list.filter(t => t.id !== id));
    }

    private show(type: ToastType, message: string, durationMs: number): void {
        const id = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
        const toast: Toast = { id, type, message, durationMs };
        this.toasts.update(list => [...list, toast]);
        window.setTimeout(() => this.dismiss(id), durationMs);
    }
}
