import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SignalrService } from '../../core/services/signalr.service';
import { NotificationService } from '../../core/services/notification.service';
import { PagedResult } from '../../core/models/paged-result.model';
import { AppNotification } from '../../core/models/notification.model';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss'
})
export class NavComponent implements OnInit {
  unreadCount = 0;

  constructor(
    public auth: AuthService,
    private router: Router,
    private signalr: SignalrService,
    private notifications: NotificationService
  ) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn()) {
      this.signalr.connect();
      this.refreshUnreadCount();
    }
  }

  refreshUnreadCount(): void {
    this.notifications.getNotifications({ isRead: false, pageSize: 100 }).subscribe({
      next: (res: PagedResult<AppNotification>) => (this.unreadCount = res.totalItems),
      error: () => (this.unreadCount = 0)
    });
  }

  logout(): void {
    this.signalr.disconnect();
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
