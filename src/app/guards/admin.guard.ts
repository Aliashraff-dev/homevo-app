import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

function decodeToken(token: string): any {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
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
  const role = decoded ? decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] : null;

  if (role !== 'Admin') {
    router.navigate(['/']);
    return false;
  }

  return true;
};
