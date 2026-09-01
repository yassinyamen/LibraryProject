/**
 * Extra descriptive info that does NOT live in the backend's Book model
 * (isbn, title, author, category, availability, copy counts only).
 * Fetched client-side from Open Library, keyed by the book's ISBN.
 */
export interface BookMetadata {
  isbn: string;
  authors: string[];
  numberOfPages?: number;
  publishDate?: string;
  publishers?: string[];
  subjects?: string[];
  description?: string;
  coverUrl?: string;
}
