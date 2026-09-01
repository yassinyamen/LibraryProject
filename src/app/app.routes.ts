import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'books',
    canActivate: [authGuard],
    loadComponent: () => import('./features/books/books.component').then((m) => m.BooksComponent)
  },
  {
    path: 'requests/my',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/my-requests/my-requests.component').then((m) => m.MyRequestsComponent)
  },
  {
    path: 'admin/requests',
    canActivate: [authGuard, adminGuard],
    loadComponent: () =>
      import('./features/admin-requests/admin-requests.component').then((m) => m.AdminRequestsComponent)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/notifications/notifications.component').then((m) => m.NotificationsComponent)
  },
  { path: '**', redirectTo: 'books' }
];
