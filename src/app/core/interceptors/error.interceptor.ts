/**
 * @file error.interceptor.ts
 * @description Intercepteur HTTP — gestion centralisée des erreurs API.
 *
 * Comportements :
 * - 401 → Déconnecte l'utilisateur et redirige vers /connexion
 * - 403 → Notification d'accès refusé
 * - 422 → Notification d'erreur de validation
 * - 500 → Notification d'erreur serveur générique
 *
 * @module core/interceptors
 */

import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

/**
 * Intercepteur fonctionnel de gestion des erreurs HTTP.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificationService = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Token expiré ou invalide — déconnexion automatique
          authService.logout();
          notificationService.warning('Votre session a expiré. Veuillez vous reconnecter.');
          break;

        case 403:
          notificationService.error('Accès refusé — vous n\'avez pas les droits nécessaires.');
          break;

        case 409:
          // Conflit (créneau déjà pris, email dupliqué, etc.)
          notificationService.warning(
            error.error?.error ?? 'Une ressource avec ces données existe déjà.'
          );
          break;

        case 422:
          notificationService.error('Données invalides. Vérifiez les champs du formulaire.');
          break;

        case 429:
          notificationService.warning('Trop de requêtes. Veuillez patienter quelques instants.');
          break;

        case 500:
        case 502:
        case 503:
          notificationService.error('Erreur serveur. Réessayez dans quelques instants.');
          break;

        default:
          if (!navigator.onLine) {
            notificationService.error('Connexion internet perdue.');
          }
      }

      return throwError(() => error);
    })
  );
};
