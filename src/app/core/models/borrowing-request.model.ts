export type BorrowingRequestStatus = 'Pending' | 'Approved' | 'Denied' | 'Returned' | 'Expired';

export interface BorrowingRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  status: BorrowingRequestStatus;
  borrowingPeriodDays: number;
  requestedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  denyReason?: string | null;
}

export interface BorrowRequestCreate {
  bookId: string;
  userId: string;
  borrowingPeriodDays: number;
}

export interface BorrowRequestApprove {
  approvedByAdminId: string;
  approvalNote?: string;
}

export interface BorrowRequestDeny {
  deniedByAdminId: string;
  reason: string;
}

export interface RequestsListQuery {
  page?: number;
  pageSize?: number;
  status?: BorrowingRequestStatus;
  userId?: string;
  bookId?: string;
  fromDate?: string;
  toDate?: string;
}
