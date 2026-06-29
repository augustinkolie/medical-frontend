/**
 * @file role.guard.ts
 * @description Guard de protection des routes par rôle utilisateur.
 *
 * @module core/guards
 */

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleUser } from '../models';

/**
 * Factory de guard de rôle.
 * Retourne un guard fonctionnel qui autorise uniquement les rôles spécifiés.
 *
 * @param allowedRoles - Rôles autorisés à accéder à la route
 * @returns Guard fonctionnel Angular
 *
 * @example
 * // Route réservée aux admins
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard('admin')],
 *   loadComponent: () => import('./features/admin/...')
 * }
 */
export function roleGuard(...allowedRoles: RoleUser[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();

    if (!user) {
      return router.createUrlTree(['/connexion']);
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // Redirige vers la page d'accueil si le rôle est insuffisant
    return router.createUrlTree(['/']);
  };
}
