import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface RealtimeNotification {
  notificationId: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

/**
 * Wraps the /notificationHub SignalR connection.
 * The backend accepts the app JWT on the "access_token" query string for this
 * hub specifically (browsers can't set custom headers during the WebSocket
 * handshake), so we still send the same JWT there via accessTokenFactory.
 */
@Injectable({ providedIn: 'root' })
export class SignalrService {
  private connection: signalR.HubConnection | null = null;

  /** Latest push received, exposed as a signal so components can react to it. */
  readonly lastNotification = signal<RealtimeNotification | null>(null);

  constructor(private auth: AuthService) {}

  connect(): void {
    if (this.connection) return;

    const token = this.auth.getToken();
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(environment.notificationHubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.connection.on('NewBorrowRequest', (notification: RealtimeNotification) => {
      this.lastNotification.set(notification);
    });

    this.connection.start().catch((err) => {
      // A dropped/failed SignalR connection should never break the rest of the app -
      // notifications still work via polling GET /api/notifications.
      console.warn('SignalR connection failed, falling back to polling only.', err);
    });
  }

  disconnect(): void {
    this.connection?.stop();
    this.connection = null;
  }
}
