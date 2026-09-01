import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { BookMetadata } from '../models/book-metadata.model';

/**
 * Looks up extra descriptive info (page count, publish date, description, cover)
 * from the free Open Library API by ISBN. This is purely a frontend enrichment -
 * the backend/database never store or return these fields.
 *
 * Docs: https://openlibrary.org/dev/docs/api/books
 * No API key required. If the ISBN isn't found (or the book has no ISBN at
 * all), callers get `null` back instead of an error, so the UI can just show
 * "not available" rather than breaking.
 */
@Injectable({ providedIn: 'root' })
export class BookMetadataService {
  private readonly baseUrl = 'https://openlibrary.org/api/books';

  constructor(private http: HttpClient) {}

  getByIsbn(isbn: string): Observable<BookMetadata | null> {
    const cleanIsbn = isbn.replace(/[^0-9Xx]/g, '');
    const url = `${this.baseUrl}?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;

    return this.http.get<Record<string, any>>(url).pipe(
      map((res) => {
        const data = res[`ISBN:${cleanIsbn}`];
        if (!data) return null;

        const metadata: BookMetadata = {
          isbn: cleanIsbn,
          authors: (data.authors ?? []).map((a: any) => a.name),
          numberOfPages: data.number_of_pages,
          publishDate: data.publish_date,
          publishers: (data.publishers ?? []).map((p: any) => p.name),
          subjects: (data.subjects ?? []).slice(0, 5).map((s: any) => s.name),
          description: typeof data.notes === 'string' ? data.notes : undefined,
          coverUrl: data.cover?.medium ?? data.cover?.small
        };

        return metadata;
      }),
      catchError(() => of(null))
    );
  }
}
