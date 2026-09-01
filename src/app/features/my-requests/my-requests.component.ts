import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BorrowService } from '../../core/services/borrow.service';
import { BorrowingRequest, BorrowingRequestStatus } from '../../core/models/borrowing-request.model';

@Component({
  selector: 'app-my-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-requests.component.html',
  styleUrl: './my-requests.component.scss'
})
export class MyRequestsComponent implements OnInit {
  requests = signal<BorrowingRequest[]>([]);
  loading = signal(false);
  statusFilter: BorrowingRequestStatus | '' = '';

  constructor(private borrowService: BorrowService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.borrowService
      .getMyRequests({ status: this.statusFilter || undefined, pageSize: 50 })
      .subscribe({
        next: (res) => {
          this.requests.set(res.items);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  statusClass(status: BorrowingRequestStatus): string {
    return 'status status-' + status.toLowerCase();
  }
}
