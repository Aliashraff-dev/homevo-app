import { HttpClient, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

const API_BASE = environment.apiBaseUrl;
const REFRESH_URL = `${API_BASE}/Auth/refresh-token`;

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function getAccessToken(): string | null {
  return localStorage.getItem('token') || localStorage.getItem('accessToken');
}

function getRefreshToken(): string | null {
  return localStorage.getItem('refreshToken');
}

function saveTokens(token: string, refreshToken?: string): void {
  localStorage.setItem('token', token);
  localStorage.setItem('accessToken', token);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
}

function clearAuthAndRedirect(router: Router): void {
  localStorage.removeItem('token');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  router.navigate(['/login']);
}

function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const isApiRequest = req.url.startsWith(API_BASE);
  const isRefreshRequest = req.url === REFRESH_URL;

  const currentToken = getAccessToken();
  const authReq = isApiRequest && !isRefreshRequest && currentToken
    ? addAuthHeader(req, currentToken)
    : req;

  return next(authReq).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        !isApiRequest ||
        isRefreshRequest
      ) {
        return throwError(() => error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearAuthAndRedirect(router);
        return throwError(() => error);
      }

      if (!isRefreshing) {
        isRefreshing = true;
        refreshTokenSubject.next(null);

        return http.post<{ token?: string; refreshToken?: string }>(REFRESH_URL, { refreshToken }).pipe(
          switchMap((res) => {
            const newToken = res?.token;
            if (!newToken) {
              isRefreshing = false;
              clearAuthAndRedirect(router);
              return throwError(() => error);
            }
            saveTokens(newToken, res.refreshToken);
            isRefreshing = false;
            refreshTokenSubject.next(newToken);
            return next(addAuthHeader(req, newToken));
          }),
          catchError((refreshErr) => {
            isRefreshing = false;
            refreshTokenSubject.next(null);
            clearAuthAndRedirect(router);
            return throwError(() => refreshErr);
          })
        );
      }

      return refreshTokenSubject.pipe(
        filter((token): token is string => token !== null),
        take(1),
        switchMap((newToken: string) => next(addAuthHeader(req, newToken)))
      );
    })
  );
};
