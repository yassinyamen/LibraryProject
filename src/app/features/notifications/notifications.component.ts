import { Component, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { SignalrService } from '../../core/services/signalr.service';
import { AppNotification } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  notifications = signal<AppNotification[]>([]);
  loading = signal(false);

  constructor(private notificationService: NotificationService, private signalr: SignalrService) {
    // Re-fetch whenever a real-time push comes in via SignalR.
    effect(() => {
      if (this.signalr.lastNotification()) {
        this.load();
      }
    });
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.notificationService.getNotifications({ pageSize: 50 }).subscribe({
      next: (res) => {
        this.notifications.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  markRead(n: AppNotification): void {
    if (n.isRead) return;

    this.notificationService.markAsRead(n.id).subscribe({
      next: (updated) => {
        this.notifications.update((list) => list.map((x) => (x.id === updated.id ? updated : x)));
      }
    });
  }
}
