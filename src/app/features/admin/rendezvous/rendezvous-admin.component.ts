/**
 * @file rendezvous-admin.component.ts
 * @description Vue d'administration des rendez-vous de tous les patients.
 * @module features/admin/rendezvous
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RendezVousService } from '../../rendezvous/rendezvous.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RendezVous } from '../../../core/models';

@Component({
  selector: 'app-rendezvous-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar glass-card">
        <h2 class="sidebar-title">Administration</h2>
        <nav class="admin-nav">
          <a routerLink="/admin" class="admin-nav__link"><i class="ph ph-chart-bar"></i> Tableau de bord</a>
          <a routerLink="/admin/rendezvous" class="admin-nav__link active"><i class="ph ph-calendar-check"></i> Rendez-vous</a>
          <a routerLink="/admin/medecins" class="admin-nav__link"><i class="ph ph-user-gear"></i> Médecins</a>
          <a routerLink="/admin/absences" class="admin-nav__link"><i class="ph ph-calendar"></i> Absences</a>
        </nav>
      </aside>
      
      <main class="admin-main">
        <div class="header-section">
          <h1 class="page-title">Rendez-vous Patients</h1>
          <p class="page-subtitle">Gérez et suivez tous les rendez-vous de la plateforme.</p>
        </div>
        
        <div class="glass-card p-6">
           <div class="flex-between mb-6">
              <h3>Historique des rendez-vous</h3>
              <div class="filter-badges">
                <span class="count-badge">{{ rdvs().length }} total</span>
              </div>
           </div>
           
           @if (isLoading()) {
              <div class="loading-state"><span class="spinner"></span> Chargement...</div>
           } @else if (rdvs().length === 0) {
              <div class="empty-state">
                 <span class="empty-icon"><i class="ph ph-calendar-blank"></i></span>
                 <p>Aucun rendez-vous enregistré.</p>
              </div>
           } @else {
              <div class="table-container">
                 <table class="data-table">
                    <thead>
                       <tr>
                          <th>Date &amp; Heure</th>
                          <th>Patient</th>
                          <th>Médecin</th>
                          <th>Centre</th>
                          <th>Statut</th>
                          <th class="text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       @for (rdv of rdvs(); track rdv.id) {
                          <tr>
                             <td class="font-medium">{{ formatDateTime(rdv.dateHeure) }}</td>
                             <td>
                                <div>{{ rdv.patientNom }}</div>
                                <div class="text-sm text-muted">{{ rdv.patientEmail }}</div>
                             </td>
                             <td>Dr. {{ rdv.medecin.nom }} <br/><span class="text-xs text-primary">{{ rdv.medecin.specialite?.nom }}</span></td>
                             <td class="text-sm">{{ rdv.centre.nom }}</td>
                             <td>
                                <span class="status-badge" [class]="'status-badge--' + rdv.statut">
                                   {{ rdv.statut === 'confirme' ? 'Confirmé' : (rdv.statut === 'annule' ? 'Annulé' : 'Terminé') }}
                                </span>
                             </td>
                             <td class="text-right actions-cell">
                                @if (rdv.statut !== 'confirme' && rdv.statut !== 'termine') {
                                  <button 
                                    class="btn-action btn-confirm" 
                                    (click)="confirmRdv(rdv.id)"
                                    title="Confirmer le rendez-vous"
                                    [disabled]="processingId() === rdv.id">
                                    <i class="ph ph-check"></i>
                                  </button>
                                }
                                @if (rdv.statut !== 'annule' && rdv.statut !== 'termine') {
                                  <button 
                                    class="btn-action btn-cancel" 
                                    (click)="cancelRdv(rdv.id)"
                                    title="Annuler le rendez-vous"
                                    [disabled]="processingId() === rdv.id">
                                    <i class="ph ph-x"></i>
                                  </button>
                                }
                                @if (rdv.statut === 'termine') {
                                  <span class="text-xs text-muted">—</span>
                                }
                             </td>
                          </tr>
                       }
                    </tbody>
                 </table>
              </div>
           }
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
    
    .p-6 { padding: var(--space-6); }
    .mb-6 { margin-bottom: var(--space-6); }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    h3 { color: var(--color-text-primary); font-weight: 600; font-size: 1.2rem; }
    
    .count-badge { background: rgba(99,102,241,0.1); color: var(--color-primary); padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.8rem; font-weight: 600; }
    
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: var(--space-3) var(--space-4); border-bottom: 2px solid var(--color-border); color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .data-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-primary); vertical-align: top; }
    .data-table tbody tr:hover { background: var(--color-surface-hover); }
    
    .font-medium { font-weight: 500; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .text-muted { color: var(--color-text-muted); }
    .text-primary { color: var(--color-primary); }
    .text-right { text-align: right; }
    
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; }
    .status-badge--confirme { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-badge--annule { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .status-badge--termine { background: rgba(107, 114, 128, 0.15); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.3); }
    
    .actions-cell { display: flex; gap: var(--space-2); justify-content: flex-end; align-items: center; min-height: 48px; }
    .btn-action { width: 32px; height: 32px; border-radius: var(--radius-sm); border: 1px solid; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 1rem; }
    .btn-action:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-confirm { color: #10b981; border-color: #10b981; background: transparent; }
    .btn-confirm:hover:not(:disabled) { background: #10b981; color: white; }
    .btn-cancel { color: #ef4444; border-color: #ef4444; background: transparent; }
    .btn-cancel:hover:not(:disabled) { background: #ef4444; color: white; }
    
    .empty-state { text-align: center; padding: var(--space-12); color: var(--color-text-muted); border: 1px dashed var(--color-border); border-radius: var(--radius-md); }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: var(--space-4); opacity: 0.5; }
    .loading-state { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    
    @media (max-width: 768px) {
      .admin-layout { flex-direction: column; padding: var(--space-4); gap: var(--space-4); }
      .admin-sidebar { display: none; }
      .header-section { margin-bottom: var(--space-4); }
      .p-6 { padding: var(--space-4); }
      .flex-between { flex-wrap: wrap; gap: var(--space-3); }
      .data-table th, .data-table td { padding: var(--space-2) var(--space-3); font-size: 0.85rem; }
    }
  `]
})
export class RendezvousAdminComponent implements OnInit {
  private readonly rdvService = inject(RendezVousService);
  private readonly notificationService = inject(NotificationService);
  
  readonly rdvs = signal<RendezVous[]>([]);
  readonly isLoading = signal(true);
  readonly processingId = signal<number | null>(null);

  ngOnInit() {
    this.loadRdvs();
  }

  loadRdvs() {
    this.isLoading.set(true);
    this.rdvService.getAllRendezVous().subscribe({
      next: (data) => {
        this.rdvs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  confirmRdv(id: number) {
    this.processingId.set(id);
    this.rdvService.confirmerRendezVous(id).subscribe({
      next: () => {
        this.notificationService.success('Rendez-vous confirmé !');
        this.processingId.set(null);
        this.loadRdvs();
      },
      error: () => this.processingId.set(null)
    });
  }

  cancelRdv(id: number) {
    if (!confirm('Voulez-vous vraiment annuler ce rendez-vous ?')) return;
    this.processingId.set(id);
    this.rdvService.annulerRendezVous(id).subscribe({
      next: () => {
        this.notificationService.success('Rendez-vous annulé.');
        this.processingId.set(null);
        this.loadRdvs();
      },
      error: () => this.processingId.set(null)
    });
  }

  formatDateTime(isoStr: string): string {
    return new Date(isoStr).toLocaleString('fr-FR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}


