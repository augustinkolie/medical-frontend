/**
 * @file auth.guard.ts
 * @description Guard de protection des routes authentifiées.
 *
 * @module core/guards
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard fonctionnel Angular (Angular 17+ functional guard).
 * Bloque l'accès aux routes protégées si l'utilisateur n'est pas connecté.
 * Redirige vers `/connexion` avec l'URL cible pour restaurer la navigation.
 *
 * @example
 * // Dans app.routes.ts
 * {
 *   path: 'admin',
 *   canActivate: [authGuard],
 *   loadComponent: () => import('./features/admin/...')
 * }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Redirige en conservant l'URL cible pour redirection post-login
  return router.createUrlTree(['/connexion'], {
    queryParams: { returnUrl: state.url },
  });
};
