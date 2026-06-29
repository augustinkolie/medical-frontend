/**
 * @file navbar.component.ts
 * @description Barre de navigation globale réactive selon l'état d'authentification.
 *
 * @module shared/components/navbar
 */

import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Composant de barre de navigation.
 * Affiche différents liens selon le rôle (admin/patient/anonyme).
 * Inclut un menu hamburger pour mobile.
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="navbar" role="banner">
      <div class="navbar__container">
        <!-- Logo & marque -->
        <a routerLink="/" class="navbar__brand" aria-label="MediRDV - Accueil">
          <span class="navbar__logo"><i class="ph ph-heartbeat" style="color: var(--color-primary);"></i></span>
          <span class="navbar__title">Medi<span class="navbar__title--accent">RDV</span></span>
        </a>

        <!-- Navigation principale (desktop) -->
        <nav class="navbar__nav" role="navigation" aria-label="Navigation principale">
          @if (!authService.isAdmin()) {
            <a routerLink="/" routerLinkActive="navbar__link--active"
               [routerLinkActiveOptions]="{ exact: true }"
               class="navbar__link">
              Centres
            </a>
            <a routerLink="/reserver" routerLinkActive="navbar__link--active"
               class="navbar__link">
              Prendre RDV
            </a>

            @if (authService.isAuthenticated()) {
              <a routerLink="/mes-rdv" routerLinkActive="navbar__link--active"
                 class="navbar__link">
                Mes RDV
              </a>
            }
          }

          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="navbar__link--active"
               [routerLinkActiveOptions]="{ exact: true }"
               class="navbar__link navbar__link--admin">
              <i class="ph ph-chart-bar"></i> Dashboard
            </a>
            <a routerLink="/admin/rendezvous" routerLinkActive="navbar__link--active"
               class="navbar__link navbar__link--admin">
              <i class="ph ph-calendar-check"></i> Rendez-vous
            </a>
            <a routerLink="/admin/medecins" routerLinkActive="navbar__link--active"
               class="navbar__link navbar__link--admin">
              <i class="ph ph-user-gear"></i> Médecins
            </a>
            <a routerLink="/admin/absences" routerLinkActive="navbar__link--active"
               class="navbar__link navbar__link--admin">
              <i class="ph ph-calendar"></i> Absences
            </a>
          }
        </nav>

        <!-- Actions utilisateur (desktop) -->
        <div class="navbar__actions">
          @if (authService.isAuthenticated()) {
            <div class="navbar__user">
              <span class="navbar__user-name">
                {{ authService.currentUser()?.prenom ?? authService.currentUser()?.email }}
              </span>
              <span class="navbar__role-badge" [class.navbar__role-badge--admin]="authService.isAdmin()">
                {{ authService.isAdmin() ? 'Admin' : 'Patient' }}
              </span>
              <button class="btn btn--outline btn--sm" (click)="authService.logout()">
                Déconnexion
              </button>
            </div>
          } @else {
            <a routerLink="/connexion" class="btn btn--primary btn--sm">
              Connexion
            </a>
          }
        </div>

        <!-- Bouton hamburger (mobile) -->
        <button class="navbar__hamburger" (click)="toggleMobileMenu()" [attr.aria-expanded]="isMobileMenuOpen()" aria-label="Menu">
          <span class="hamburger-line" [class.hamburger-line--open]="isMobileMenuOpen()"></span>
          <span class="hamburger-line" [class.hamburger-line--open]="isMobileMenuOpen()"></span>
          <span class="hamburger-line" [class.hamburger-line--open]="isMobileMenuOpen()"></span>
        </button>
      </div>

      <!-- Menu mobile (overlay) -->
      @if (isMobileMenuOpen()) {
        <div class="mobile-overlay" (click)="closeMobileMenu()"></div>
        <div class="mobile-menu">
          <nav class="mobile-nav">
            @if (!authService.isAdmin()) {
              <a routerLink="/" class="mobile-link" (click)="closeMobileMenu()"><i class="ph ph-hospital"></i> Centres</a>
              <a routerLink="/reserver" class="mobile-link" (click)="closeMobileMenu()"><i class="ph ph-calendar-plus"></i> Prendre RDV</a>
              @if (authService.isAuthenticated()) {
                <a routerLink="/mes-rdv" class="mobile-link" (click)="closeMobileMenu()"><i class="ph ph-calendar-check"></i> Mes RDV</a>
              }
            }
            @if (authService.isAdmin()) {
              <a routerLink="/admin" class="mobile-link mobile-link--admin" (click)="closeMobileMenu()"><i class="ph ph-chart-bar"></i> Dashboard</a>
              <a routerLink="/admin/rendezvous" class="mobile-link mobile-link--admin" (click)="closeMobileMenu()"><i class="ph ph-calendar-check"></i> Rendez-vous</a>
              <a routerLink="/admin/medecins" class="mobile-link mobile-link--admin" (click)="closeMobileMenu()"><i class="ph ph-user-gear"></i> Médecins</a>
              <a routerLink="/admin/absences" class="mobile-link mobile-link--admin" (click)="closeMobileMenu()"><i class="ph ph-calendar"></i> Absences</a>
            }
          </nav>
          <div class="mobile-footer">
            @if (authService.isAuthenticated()) {
              <div class="mobile-user-info">
                <span class="navbar__role-badge" [class.navbar__role-badge--admin]="authService.isAdmin()">
                  {{ authService.isAdmin() ? 'Admin' : 'Patient' }}
                </span>
                <span class="mobile-user-name">{{ authService.currentUser()?.prenom ?? authService.currentUser()?.email }}</span>
              </div>
              <button class="btn btn--outline btn--full" (click)="authService.logout(); closeMobileMenu()">Déconnexion</button>
            } @else {
              <a routerLink="/connexion" class="btn btn--primary btn--full" (click)="closeMobileMenu()">Connexion</a>
            }
          </div>
        </div>
      }
    </header>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: var(--z-navbar);
      height: var(--navbar-height);
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--color-border);
    }

    .navbar__container {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 0 var(--space-6);
      height: 100%;
      display: flex;
      align-items: center;
      gap: var(--space-8);
    }

    .navbar__brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      text-decoration: none;
      flex-shrink: 0;
    }

    .navbar__logo { font-size: 1.5rem; }

    .navbar__title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      letter-spacing: -0.02em;
    }

    .navbar__title--accent { color: var(--color-primary); }

    .navbar__nav {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      flex: 1;
    }

    .navbar__link {
      padding: var(--space-2) var(--space-3);
      color: var(--color-text-secondary);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 500;
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    .navbar__link:hover { color: var(--color-text-primary); background: var(--color-surface-hover); }
    .navbar__link--active { color: var(--color-primary) !important; background: rgba(99,102,241,0.12) !important; }
    .navbar__link--admin { color: var(--color-warning) !important; }

    .navbar__actions { margin-left: auto; }

    .navbar__user {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .navbar__user-name {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }

    .navbar__role-badge {
      font-size: 0.7rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      background: rgba(99,102,241,0.15);
      color: var(--color-primary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .navbar__role-badge--admin {
      background: rgba(245,158,11,0.15);
      color: var(--color-warning);
    }

    /* ─── Hamburger (caché en desktop) ─── */
    .navbar__hamburger {
      display: none;
      flex-direction: column;
      gap: 5px;
      padding: 8px;
      background: none;
      border: none;
      cursor: pointer;
      z-index: calc(var(--z-navbar) + 2);
    }

    .hamburger-line {
      display: block;
      width: 22px;
      height: 2px;
      background: var(--color-text-primary);
      transition: all 0.3s ease;
    }
    .hamburger-line--open:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
    .hamburger-line--open:nth-child(2) { opacity: 0; }
    .hamburger-line--open:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

    /* ─── Menu mobile (caché en desktop) ─── */
    .mobile-overlay {
      display: none;
    }
    .mobile-menu {
      display: none;
    }

    /* ─── RESPONSIVE ─── */
    @media (max-width: 768px) {
      .navbar__nav { display: none; }
      .navbar__actions { display: none; }
      .navbar__hamburger { display: flex; margin-left: auto; }

      .mobile-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        z-index: calc(var(--z-navbar) + 1);
        animation: fadeIn 0.2s ease;
      }

      .mobile-menu {
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 0;
        right: 0;
        width: 280px;
        height: 100vh;
        background: var(--color-surface);
        z-index: calc(var(--z-navbar) + 2);
        padding: calc(var(--navbar-height) + var(--space-4)) var(--space-6) var(--space-6);
        box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
        animation: slideIn 0.25s ease;
      }

      .mobile-nav {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        flex: 1;
      }

      .mobile-link {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-3) var(--space-4);
        color: var(--color-text-primary);
        text-decoration: none;
        font-weight: 500;
        font-size: 1rem;
        border-radius: var(--radius-md);
        transition: background 0.2s;
      }
      .mobile-link:hover { background: var(--color-surface-hover); }
      .mobile-link--admin { color: var(--color-warning); }
      .mobile-link i { font-size: 1.25rem; }

      .mobile-footer {
        padding-top: var(--space-6);
        border-top: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }

      .mobile-user-info {
        display: flex;
        align-items: center;
        gap: var(--space-3);
      }
      .mobile-user-name {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideIn {
      from { transform: translateX(100%); }
      to { transform: translateX(0); }
    }
  `],
})
export class NavbarComponent {
  /** Injection du service d'auth (accessible dans le template) */
  readonly authService = inject(AuthService);

  /** État du menu mobile */
  readonly isMobileMenuOpen = signal(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
