import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BorrowService } from '../../core/services/borrow.service';
import { AuthService } from '../../core/services/auth.service';
import { BorrowingRequest, BorrowingRequestStatus } from '../../core/models/borrowing-request.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-requests.component.html',
  styleUrl: './admin-requests.component.scss'
})
export class AdminRequestsComponent implements OnInit {
  requests = signal<BorrowingRequest[]>([]);
  loading = signal(false);
  statusFilter: BorrowingRequestStatus | '' = 'Pending';

  actioningId = signal<string | null>(null);
  actionError = signal<string | null>(null);
  denyReasonDrafts: Record<string, string> = {};

  constructor(private borrowService: BorrowService, private auth: AuthService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.borrowService
      .getAll({ status: this.statusFilter || undefined, pageSize: 50 })
      .subscribe({
        next: (res) => {
          this.requests.set(res.items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  approve(request: BorrowingRequest): void {
    const adminId = this.auth.currentUserId();
    if (!adminId) return;

    this.actioningId.set(request.id);
    this.actionError.set(null);

    this.borrowService
      .approve(request.id, { approvedByAdminId: adminId, approvalNote: 'Approved via admin console' })
      .subscribe({
        next: () => {
          this.actioningId.set(null);
          this.load();
        },
        error: (err: HttpErrorResponse) => {
          this.actioningId.set(null);
          this.actionError.set(err.error?.message ?? 'Could not approve this request.');
        }
      });
  }

  deny(request: BorrowingRequest): void {
    const adminId = this.auth.currentUserId();
    const reason = this.denyReasonDrafts[request.id]?.trim();
    if (!adminId || !reason) {
      this.actionError.set('Please enter a denial reason first.');
      return;
    }

    this.actioningId.set(request.id);
    this.actionError.set(null);

    this.borrowService.deny(request.id, { deniedByAdminId: adminId, reason }).subscribe({
      next: () => {
        this.actioningId.set(null);
        this.load();
      },
      error: (err: HttpErrorResponse) => {
        this.actioningId.set(null);
        this.actionError.set(err.error?.message ?? 'Could not deny this request.');
      }
    });
  }
}
