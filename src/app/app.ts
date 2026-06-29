/**
 * @file app.ts
 * @description Composant racine de l'application MediRDV.
 *
 * @module app
 */

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { NotificationToastComponent } from './shared/components/notification-toast/notification-toast.component';

/**
 * Composant racine — coquille de l'application.
 * Contient la barre de navigation, le router outlet et les notifications.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, NotificationToastComponent],
  template: `
    <!-- Barre de navigation globale -->
    <app-navbar />

    <!-- Vue principale — changée par le Router -->
    <main class="main-content">
      <router-outlet />
    </main>

    <!-- Conteneur de notifications toast (positionné en fixed) -->
    <app-notification-toast />
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - var(--navbar-height));
      padding-top: var(--navbar-height);
    }
  `],
})
export class App {}
