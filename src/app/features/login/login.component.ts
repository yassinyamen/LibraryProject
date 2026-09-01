import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  form = this.fb.group({
    email: ['admin@library.com', [Validators.required, Validators.email]]
  });

  submit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    const email = this.form.value.email!;

    this.auth.login(email).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/books']);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const detail = err.status === 0
          ? 'Could not reach the API. Is the backend running and is the URL in environment.ts correct?'
          : err.error?.message ?? `Login failed (HTTP ${err.status}).`;
        this.error.set(detail);
      }
    });
  }

  quickFill(email: string): void {
    this.form.patchValue({ email });
  }
}
