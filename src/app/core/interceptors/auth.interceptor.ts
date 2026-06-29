/**
 * @file auth.interceptor.ts
 * @description Intercepteur HTTP — injecte automatiquement le Bearer token JWT.
 *
 * @module core/interceptors
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

/**
 * Intercepteur fonctionnel Angular (Angular 17+ functional interceptor).
 * Ajoute automatiquement le token JWT à toutes les requêtes sortantes.
 *
 * Si l'utilisateur n'est pas connecté, la requête est transmise sans modification.
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    // Clone la requête immuable et y ajoute l'en-tête Authorization
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
