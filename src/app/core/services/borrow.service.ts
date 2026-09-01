import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  BorrowingRequest,
  BorrowRequestApprove,
  BorrowRequestCreate,
  BorrowRequestDeny,
  RequestsListQuery
} from '../models/borrowing-request.model';
import { PagedResult } from '../models/paged-result.model';

function toParams(query: RequestsListQuery): HttpParams {
  let params = new HttpParams();
  if (query.page) params = params.set('page', query.page);
  if (query.pageSize) params = params.set('pageSize', query.pageSize);
  if (query.status) params = params.set('status', query.status);
  if (query.userId) params = params.set('userId', query.userId);
  if (query.bookId) params = params.set('bookId', query.bookId);
  if (query.fromDate) params = params.set('fromDate', query.fromDate);
  if (query.toDate) params = params.set('toDate', query.toDate);
  return params;
}

@Injectable({ providedIn: 'root' })
export class BorrowService {
  private readonly borrowUrl = `${environment.apiBaseUrl}/borrow`;
  private readonly requestsUrl = `${environment.apiBaseUrl}/requests`;

  constructor(private http: HttpClient) {}

  createRequest(dto: BorrowRequestCreate): Observable<BorrowingRequest> {
    return this.http.post<BorrowingRequest>(this.borrowUrl, dto);
  }

  getAll(query: RequestsListQuery): Observable<PagedResult<BorrowingRequest>> {
    return this.http.get<PagedResult<BorrowingRequest>>(this.requestsUrl, { params: toParams(query) });
  }

  getMyRequests(query: RequestsListQuery): Observable<PagedResult<BorrowingRequest>> {
    return this.http.get<PagedResult<BorrowingRequest>>(`${this.requestsUrl}/my`, { params: toParams(query) });
  }

  getById(id: string): Observable<BorrowingRequest> {
    return this.http.get<BorrowingRequest>(`${this.requestsUrl}/${id}`);
  }

  approve(id: string, dto: BorrowRequestApprove): Observable<BorrowingRequest> {
    return this.http.put<BorrowingRequest>(`${this.requestsUrl}/${id}/approve`, dto);
  }

  deny(id: string, dto: BorrowRequestDeny): Observable<BorrowingRequest> {
    return this.http.put<BorrowingRequest>(`${this.requestsUrl}/${id}/deny`, dto);
  }
}
