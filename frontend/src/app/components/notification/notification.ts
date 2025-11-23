import { Component, effect, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="notificationService.notification()" class="notification-container" [ngClass]="notificationService.notification()?.type || 'info'">
      <p>{{ notificationService.notification()?.message }}</p>
    </div>
  `,
  styleUrls: ['./notification.scss']
})
export class NotificationComponent implements OnDestroy {
  public notificationService = inject(NotificationService);
  private timeoutId: any;

  constructor() {
    effect(() => {
      if (this.notificationService.notification()) {
        this.timeoutId = setTimeout(() => this.notificationService.notification.set(null), 5000);
      }
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.timeoutId);
  }
}