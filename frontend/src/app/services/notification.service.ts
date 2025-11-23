import { Injectable, signal } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  message: string;
  type: NotificationType;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  public notification = signal<Notification | null>(null);

  show(message: string, type: NotificationType = 'info'): void {
    this.notification.set({ message, type });
  }
}