export type NotificationType =
  | 'BorrowRequestCreated'
  | 'BorrowDueReminder'
  | 'RequestApproved'
  | 'RequestDenied';

export interface AppNotification {
  id: string;
  recipientUserId?: string | null;
  recipientRole?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsQuery {
  page?: number;
  pageSize?: number;
  recipientUserId?: string;
  recipientRole?: string;
  isRead?: boolean;
}
