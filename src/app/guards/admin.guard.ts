import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const decoded = decodeToken(token);
  const rolesClaim =
    decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
    decoded?.role ??
    decoded?.roles ??
    null;

  const isAdmin = Array.isArray(rolesClaim)
    ? rolesClaim.includes('Admin')
    : rolesClaim === 'Admin';

  if (!isAdmin) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
