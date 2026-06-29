/**
 * @file app.config.ts
 * @description Configuration de l'application Angular — providers globaux.
 *
 * @module app
 */

import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

/**
 * Configuration principale de l'application.
 * Enregistre tous les providers au niveau racine.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    // Mode Zoneless
    provideZonelessChangeDetection(),

    // Router avec View Transitions API (animations fluides entre les pages)
    provideRouter(routes, withViewTransitions()),

    // Client HTTP avec les intercepteurs fonctionnels
    provideHttpClient(
      withInterceptors([
        authInterceptor,  // Injecte le Bearer token JWT
        errorInterceptor, // Gestion centralisée des erreurs HTTP
      ])
    ),
  ],
};
