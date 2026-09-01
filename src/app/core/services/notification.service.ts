import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification, NotificationsQuery } from '../models/notification.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getNotifications(query: NotificationsQuery): Observable<PagedResult<AppNotification>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.recipientUserId) params = params.set('recipientUserId', query.recipientUserId);
    if (query.recipientRole) params = params.set('recipientRole', query.recipientRole);
    if (query.isRead !== undefined) params = params.set('isRead', query.isRead);

    return this.http.get<PagedResult<AppNotification>>(this.baseUrl, { params });
  }

  markAsRead(id: string): Observable<AppNotification> {
    return this.http.put<AppNotification>(`${this.baseUrl}/${id}/read`, {});
  }
}
