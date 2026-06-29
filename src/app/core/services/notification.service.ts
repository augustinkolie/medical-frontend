/**
 * @file notification.service.ts
 * @description Service de notifications toast — messages flash pour l'utilisateur.
 *
 * @module core/services
 */

import { Injectable, signal } from '@angular/core';

/**
 * Types de notification disponibles (correspond aux variantes CSS).
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Structure d'une notification affichée à l'utilisateur.
 */
export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration: number;
}

/**
 * Service de gestion des notifications toast.
 * Les composants NotificationToast lisent `notifications` et l'affichent.
 *
 * @example
 * // Dans un composant
 * this.notificationService.success('Rendez-vous confirmé !');
 * this.notificationService.error('Une erreur est survenue.');
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  /** Signal contenant la liste des notifications actives */
  readonly notifications = signal<Notification[]>([]);

  /**
   * Affiche une notification de succès.
   * @param message - Message à afficher
   * @param duration - Durée en ms (défaut: 4000ms)
   */
  success(message: string, duration = 4000): void {
    this.show({ type: 'success', message, duration });
  }

  /**
   * Affiche une notification d'erreur.
   * @param message - Message à afficher
   * @param duration - Durée en ms (défaut: 6000ms)
   */
  error(message: string, duration = 6000): void {
    this.show({ type: 'error', message, duration });
  }

  /**
   * Affiche un avertissement.
   */
  warning(message: string, duration = 5000): void {
    this.show({ type: 'warning', message, duration });
  }

  /**
   * Affiche une notification informative.
   */
  info(message: string, duration = 4000): void {
    this.show({ type: 'info', message, duration });
  }

  /**
   * Ferme une notification par son identifiant.
   * @param id - Identifiant unique de la notification
   */
  dismiss(id: string): void {
    this.notifications.update((notifications) =>
      notifications.filter((n) => n.id !== id)
    );
  }

  /**
   * Affiche une notification et la retire automatiquement après sa durée.
   */
  private show(opts: Omit<Notification, 'id'>): void {
    const id = crypto.randomUUID();
    const notification: Notification = { id, ...opts };

    this.notifications.update((n) => [...n, notification]);

    // Retrait automatique après la durée configurée
    setTimeout(() => this.dismiss(id), opts.duration);
  }
}
