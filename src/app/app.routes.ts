/**
 * @file app.routes.ts
 * @description Définition des routes de l'application MediRDV.
 *
 * Toutes les features sont chargées en **lazy loading** pour des
 * performances optimales (code splitting automatique par Angular).
 *
 * @module app
 */

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

/**
 * Routes de l'application MediRDV.
 *
 * Structure :
 * - `/`              → Page d'accueil (liste des centres)
 * - `/connexion`     → Page de connexion
 * - `/reserver`      → Flux de réservation (lazy)
 * - `/mes-rdv`       → Mes rendez-vous (lazy, authentifié)
 * - `/admin`         → Tableau de bord admin (lazy, rôle admin)
 * - `**`             → Redirection 404
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/centres/centres-list/centres-list.component').then(
        (m) => m.CentresListComponent
      ),
    title: 'MediRDV — Centres médicaux',
  },
  {
    path: 'connexion',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'MediRDV — Connexion',
  },
  {
    path: 'reserver',
    loadComponent: () =>
      import('./features/rendezvous/booking/booking.component').then(
        (m) => m.BookingComponent
      ),
    title: 'MediRDV — Prendre un rendez-vous',
  },
  {
    path: 'mes-rdv',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/rendezvous/mes-rdv/mes-rdv.component').then(
        (m) => m.MesRdvComponent
      ),
    title: 'MediRDV — Mes rendez-vous',
  },
  {
    path: 'admin',
    canActivate: [roleGuard('admin')],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'MediRDV — Administration',
      },
      {
        path: 'rendezvous',
        loadComponent: () =>
          import('./features/admin/rendezvous/rendezvous-admin.component').then(
            (m) => m.RendezvousAdminComponent
          ),
        title: 'MediRDV — Gestion des rendez-vous',
      },
      {
        path: 'medecins',
        loadComponent: () =>
          import('./features/admin/medecins/medecins-admin.component').then(
            (m) => m.MedecinsAdminComponent
          ),
        title: 'MediRDV — Gestion des médecins',
      },
      {
        path: 'absences',
        loadComponent: () =>
          import('./features/admin/absences/absences-admin.component').then(
            (m) => m.AbsencesAdminComponent
          ),
        title: 'MediRDV — Gestion des absences',
      },
    ],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
