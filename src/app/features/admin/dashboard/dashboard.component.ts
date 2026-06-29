/**
 * @file dashboard.component.ts
 * @description Tableau de bord de l'administration.
 * @module features/admin/dashboard
 */

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar glass-card">
        <h2 class="sidebar-title">Administration</h2>
        <nav class="admin-nav">
          <a routerLink="/admin" class="admin-nav__link active"><i class="ph ph-chart-bar"></i> Tableau de bord</a>
          <a routerLink="/admin/rendezvous" class="admin-nav__link"><i class="ph ph-calendar-check"></i> Rendez-vous</a>
          <a routerLink="/admin/medecins" class="admin-nav__link"><i class="ph ph-user-gear"></i> Médecins</a>
          <a routerLink="/admin/absences" class="admin-nav__link"><i class="ph ph-calendar"></i> Absences</a>
        </nav>
      </aside>
      
      <main class="admin-main">
        <div class="header-section">
          <h1 class="page-title">Tableau de bord</h1>
          <p class="page-subtitle">Vue d'ensemble de l'activité de MediRDV.</p>
        </div>
        
        <div class="stats-grid">
           <div class="stat-card glass-card">
               <div class="stat-card__icon"><i class="ph ph-hospital" style="color: var(--color-primary);"></i></div>
              <div class="stat-card__info">
                 <span class="stat-card__label">Centres Actifs</span>
                 <span class="stat-card__value">5</span>
              </div>
           </div>
           <div class="stat-card glass-card">
               <div class="stat-card__icon"><i class="ph ph-user-circle-gear" style="color: var(--color-primary);"></i></div>
              <div class="stat-card__info">
                 <span class="stat-card__label">Médecins Inscrits</span>
                 <span class="stat-card__value">10</span>
              </div>
           </div>
           <div class="stat-card glass-card">
               <div class="stat-card__icon"><i class="ph ph-calendar" style="color: var(--color-primary);"></i></div>
              <div class="stat-card__info">
                 <span class="stat-card__label">RDV du jour</span>
                 <span class="stat-card__value">24</span>
              </div>
           </div>
        </div>

        <div class="dashboard-content">
           <div class="glass-card p-6">
              <h3>Activité récente</h3>
              <p class="text-muted mt-2">Les statistiques détaillées seront implémentées prochainement.</p>
           </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: calc(100vh - var(--navbar-height)); gap: var(--space-6); padding: var(--space-6); max-width: 1200px; margin: 0 auto; }
    .admin-sidebar { width: 250px; padding: var(--space-6); height: fit-content; }
    .sidebar-title { font-size: 1.1rem; color: var(--color-text-primary); margin-bottom: var(--space-6); font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
    .admin-nav { display: flex; flex-direction: column; gap: var(--space-2); }
    .admin-nav__link { padding: var(--space-3); color: var(--color-text-secondary); text-decoration: none; border-radius: var(--radius-md); transition: all 0.2s; display: flex; align-items: center; gap: var(--space-3); }
    .admin-nav__link:hover { background: var(--color-surface-hover); color: var(--color-text-primary); }
    .admin-nav__link.active { background: rgba(99,102,241,0.15); color: var(--color-primary); font-weight: 500; }
    
    .admin-main { flex: 1; min-width: 0; }
    .header-section { margin-bottom: var(--space-8); }
    .page-title { font-size: 2rem; color: var(--color-text-primary); margin-bottom: var(--space-2); }
    .page-subtitle { color: var(--color-text-secondary); }
    
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); margin-bottom: var(--space-8); }
    .stat-card { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-5); }
    .stat-card__icon { font-size: 2.5rem; width: 64px; height: 64px; display: flex; align-items: center; justify-content: center; background: var(--color-surface-hover); border-radius: var(--radius-lg); }
    .stat-card__info { display: flex; flex-direction: column; }
    .stat-card__label { font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
    .stat-card__value { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); line-height: 1; }
    
    .p-6 { padding: var(--space-6); }
    .text-muted { color: var(--color-text-muted); font-size: 0.9rem; }
    .mt-2 { margin-top: var(--space-2); }
    h3 { color: var(--color-text-primary); font-weight: 600; font-size: 1.2rem; }

    /* ─── Responsive ─── */
    @media (max-width: 768px) {
      .admin-layout { flex-direction: column; padding: var(--space-4); gap: var(--space-4); }
      .admin-sidebar { display: none; }
      .header-section { margin-bottom: var(--space-4); }
      .stats-grid { grid-template-columns: 1fr 1fr; gap: var(--space-3); }
      .stat-card { padding: var(--space-3); }
      .stat-card__icon { width: 48px; height: 48px; font-size: 1.8rem; }
      .stat-card__value { font-size: 1.3rem; }
      .p-6 { padding: var(--space-4); }
    }
    @media (max-width: 480px) {
      .stats-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent {}
