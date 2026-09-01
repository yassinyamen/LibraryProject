import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { GatewayTokenService } from '../services/gateway-token.service';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const gatewayToken = inject(GatewayTokenService);

  const isGatewayCall = req.url.startsWith(environment.gateway.baseUrl);
  const isBackendCall = req.url.startsWith(environment.apiBaseUrl);

  if (!isGatewayCall && !isBackendCall) {
    // Third-party calls (e.g. Open Library) - no auth headers at all.
    return next(req);
  }

  const appToken = auth.getToken();

  const attachHeadersAndSend = (wso2Token?: string) => {
    const headers: Record<string, string> = {};
    if (appToken) headers['X-Auth-Token'] = appToken;
    if (wso2Token) headers['Authorization'] = `Bearer ${wso2Token}`;

    const authedReq = req.clone({ setHeaders: headers });

    return next(authedReq).pipe(
      catchError((err: HttpErrorResponse) => {
        console.error(`[HTTP ${err.status}] ${req.method} ${req.url}`, err.error ?? err.message);
        if (err.status === 401) {
          auth.logout();
          if (router.url !== '/login') router.navigate(['/login']);
        }
        return throwError(() => err);
      })
    );
  };

  if (isGatewayCall) {
    // Gateway calls need both: X-Auth-Token (this app's user) + Authorization (WSO2).
    return from(gatewayToken.getToken()).pipe(
      switchMap((wso2Token) => attachHeadersAndSend(wso2Token))
    );
  }

  // Direct backend calls only need the app JWT.
  return attachHeadersAndSend();
};