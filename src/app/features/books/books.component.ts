import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../core/services/book.service';
import { BorrowService } from '../../core/services/borrow.service';
import { AuthService } from '../../core/services/auth.service';
import { BookMetadataService } from '../../core/services/book-metadata.service';
import { Book } from '../../core/models/book.model';
import { BookMetadata } from '../../core/models/book-metadata.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent implements OnInit {
  books = signal<Book[]>([]);
  totalPages = signal(1);
  page = signal(1);
  loading = signal(false);

  search = '';
  availableOnly = false;
  sortBy: 'title' | 'author' | 'createdAt' = 'title';
  sortOrder: 'asc' | 'desc' = 'asc';

  // Details modal state (basic info + Open Library enrichment)
  detailsBook = signal<Book | null>(null);
  detailsMetadata = signal<BookMetadata | null>(null);
  detailsLoading = signal(false);
  detailsUnavailable = signal(false);

  // Borrow dialog state
  borrowingBook = signal<Book | null>(null);
  borrowDays = 14;
  borrowError = signal<string | null>(null);
  borrowSubmitting = signal(false);
  borrowSuccess = signal<string | null>(null);

  constructor(
    private bookService: BookService,
    private borrowService: BorrowService,
    private metadataService: BookMetadataService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(page = 1): void {
    this.loading.set(true);
    this.page.set(page);

    this.bookService
      .getBooks({
        page,
        pageSize: 12,
        search: this.search || undefined,
        availableOnly: this.availableOnly || undefined,
        sortBy: this.sortBy,
        sortOrder: this.sortOrder
      })
      .subscribe({
        next: (res) => {
          this.books.set(res.items);
          this.totalPages.set(res.totalPages || 1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  nextPage(): void {
    if (this.page() < this.totalPages()) this.load(this.page() + 1);
  }

  prevPage(): void {
    if (this.page() > 1) this.load(this.page() - 1);
  }

  // ----- Details modal (click on a card) -----

  openDetails(book: Book): void {
    this.detailsBook.set(book);
    this.detailsMetadata.set(null);
    this.detailsUnavailable.set(false);

    if (!book.isbn) {
      this.detailsUnavailable.set(true);
      return;
    }

    this.detailsLoading.set(true);

    this.metadataService.getByIsbn(book.isbn).subscribe({
      next: (metadata) => {
        this.detailsLoading.set(false);
        if (metadata) {
          this.detailsMetadata.set(metadata);
        } else {
          this.detailsUnavailable.set(true);
        }
      },
      error: () => {
        this.detailsLoading.set(false);
        this.detailsUnavailable.set(true);
      }
    });
  }

  closeDetails(): void {
    this.detailsBook.set(null);
    this.detailsMetadata.set(null);
    this.detailsUnavailable.set(false);
  }

  // ----- Borrow modal -----

  openBorrow(book: Book): void {
    this.borrowingBook.set(book);
    this.borrowDays = 14;
    this.borrowError.set(null);
    this.borrowSuccess.set(null);
  }

  closeBorrow(): void {
    this.borrowingBook.set(null);
  }

  submitBorrow(): void {
    const book = this.borrowingBook();
    const userId = this.auth.currentUserId();
    if (!book || !userId) return;

    this.borrowSubmitting.set(true);
    this.borrowError.set(null);

    this.borrowService
      .createRequest({ bookId: book.id, userId, borrowingPeriodDays: this.borrowDays })
      .subscribe({
        next: () => {
          this.borrowSubmitting.set(false);
          this.borrowSuccess.set(`Request submitted for "${book.title}". Track it under My Requests.`);
          this.load(this.page());
        },
        error: (err: HttpErrorResponse) => {
          this.borrowSubmitting.set(false);
          this.borrowError.set(err.error?.message ?? 'Could not submit the borrow request.');
        }
      });
  }
}
