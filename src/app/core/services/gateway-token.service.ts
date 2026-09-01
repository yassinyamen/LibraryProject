import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

interface Wso2TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

/**
 * Fetches a WSO2 access token via the OAuth2 client_credentials grant and
 * caches it in memory until shortly before it expires. Uni-project shortcut:
 * the client_secret lives in environment.ts and is exchanged directly from
 * the browser - fine for a demo, not something to do in a real deployment.
 */
@Injectable({ providedIn: 'root' })
export class GatewayTokenService {
  private cachedToken: string | null = null;
  private expiresAt = 0;

  constructor(private http: HttpClient) {}

  async getToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.expiresAt - 60_000) {
      return this.cachedToken;
    }

    const body = new URLSearchParams();
    body.set('grant_type', 'client_credentials');

    const basicAuth = btoa(`${environment.gateway.clientId}:${environment.gateway.clientSecret}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const res = await firstValueFrom(
      this.http.post<Wso2TokenResponse>(environment.gateway.tokenUrl, body.toString(), { headers })
    );

    this.cachedToken = res.access_token;
    this.expiresAt = Date.now() + res.expires_in * 1000;
    return this.cachedToken;
  }
}