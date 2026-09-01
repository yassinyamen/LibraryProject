import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Book, BooksListQuery } from '../models/book.model';
import { PagedResult } from '../models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly baseUrl = `${environment.apiBaseUrl}/books`;

  constructor(private http: HttpClient) {}

  getBooks(query: BooksListQuery): Observable<PagedResult<Book>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.search) params = params.set('search', query.search);
    if (query.availableOnly !== undefined) params = params.set('availableOnly', query.availableOnly);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.http.get<PagedResult<Book>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/${id}`);
  }
}
