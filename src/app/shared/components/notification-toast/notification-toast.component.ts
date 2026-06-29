/**
 * @file notification-toast.component.ts
 * @description Composant d'affichage des notifications toast.
 * @module shared/components/notification-toast
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, Notification } from '../../../core/services/notification.service';

/**
 * Lit le signal `notifications` du NotificationService et les affiche
 * avec des animations d'entrée/sortie.
 */
@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container" role="region" aria-label="Notifications" aria-live="polite">
      @for (notification of notificationService.notifications(); track notification.id) {
        <div
          class="toast"
          [class]="'toast--' + notification.type"
          role="alert"
        >
          <span class="toast__icon">
            @switch (notification.type) {
              @case ('success') { <i class="ph ph-check-circle" style="color: var(--color-success)"></i> }
              @case ('error') { <i class="ph ph-x-circle" style="color: var(--color-error)"></i> }
              @case ('warning') { <i class="ph ph-warning" style="color: var(--color-warning)"></i> }
              @case ('info') { <i class="ph ph-info" style="color: var(--color-primary)"></i> }
            }
          </span>
          <span class="toast__message">{{ notification.message }}</span>
          <button
            class="toast__close"
            (click)="notificationService.dismiss(notification.id)"
            aria-label="Fermer la notification"
          >×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: calc(var(--navbar-height) + var(--space-4));
      right: var(--space-6);
      z-index: var(--z-toast);
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      max-width: 400px;
      width: 100%;
    }

    .toast {
      display: flex;
      align-items: flex-start;
      gap: var(--space-3);
      padding: var(--space-4);
      border-radius: var(--radius-lg);
      background: var(--color-surface-elevated);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-lg);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to   { transform: translateX(0);    opacity: 1; }
    }

    .toast--success { border-left: 3px solid var(--color-success); }
    .toast--error   { border-left: 3px solid var(--color-error); }
    .toast--warning { border-left: 3px solid var(--color-warning); }
    .toast--info    { border-left: 3px solid var(--color-primary); }

    .toast__icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 1px; }

    .toast__message {
      flex: 1;
      font-size: 0.875rem;
      color: var(--color-text-primary);
      line-height: 1.5;
    }

    .toast__close {
      background: none;
      border: none;
      color: var(--color-text-muted);
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
      transition: color 0.2s;
    }

    .toast__close:hover { color: var(--color-text-primary); }
  `],
})
export class NotificationToastComponent {
  readonly notificationService = inject(NotificationService);
}
