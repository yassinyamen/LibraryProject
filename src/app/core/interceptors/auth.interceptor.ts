import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * Attaches the app JWT on the standard Authorization: Bearer <token> header.
 * On a 401 response, clears the stored session and redirects to /login.
 *
 * Only applied to calls to our own backend (environment.apiBaseUrl) - third-party
 * calls (e.g. the Open Library book metadata lookup) skip this entirely, since
 * sending our auth header to an external API would trip its CORS policy.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(environment.apiBaseUrl)) {
    return next(req);
  }

  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const authedReq = token ? req.clone({ setHeaders: { 'X-Auth-Token': token } }) : req;

  return next(authedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Always log the raw failure - status 0 usually means CORS/network/unreachable
      // backend, not an auth problem, and looks identical to a 401 to the naked eye otherwise.
      console.error(`[HTTP ${err.status}] ${req.method} ${req.url}`, err.error ?? err.message);

      if (err.status === 401) {
        auth.logout();
        if (router.url !== '/login') {
          router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    })
  );
};
