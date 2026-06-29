/**
 * @file mes-rdv.component.ts
 * @description Liste des rendez-vous du patient connecté.
 * @module features/rendezvous/mes-rdv
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RendezVousService } from '../rendezvous.service';
import { NotificationService } from '../../../core/services/notification.service';
import { RendezVous } from '../../../core/models';

@Component({
  selector: 'app-mes-rdv',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <div class="header-section">
        <h1 class="page-title">Mes Rendez-vous</h1>
        <p class="page-subtitle">Consultez et gérez vos prochaines consultations médicales.</p>
      </div>

      @if (isLoading()) {
        <div class="loading-state"><span class="spinner"></span> Chargement de vos rendez-vous...</div>
      } @else if (rdvs().length === 0) {
        <div class="empty-state glass-card">
          <div class="empty-icon"><i class="ph ph-calendar-blank"></i></div>
          <h3>Aucun rendez-vous</h3>
          <p>Vous n'avez aucun rendez-vous programmé pour le moment.</p>
        </div>
      } @else {
        <div class="rdv-list">
          @for (rdv of rdvs(); track rdv.id) {
            <div class="rdv-card glass-card">
              <div class="rdv-card__date">
                <span class="day">{{ getDay(rdv.dateHeure) }}</span>
                <span class="month">{{ getMonth(rdv.dateHeure) }}</span>
                <span class="time">{{ getTime(rdv.dateHeure) }}</span>
              </div>
              <div class="rdv-card__info">
                <h3>Dr. {{ rdv.medecin.prenom }} {{ rdv.medecin.nom }}</h3>
                <p class="specialite">{{ rdv.medecin.specialite.nom }}</p>
                <p class="centre"><i class="ph ph-map-pin"></i> {{ rdv.centre.nom }} - {{ rdv.centre.adresse }}</p>
                @if (rdv.motifConsult) {
                  <p class="motif"><i class="ph ph-note"></i> Motif: {{ rdv.motifConsult }}</p>
                }
                
                <div class="status-badge" [class]="'status-badge--' + rdv.statut">
                  {{ rdv.statut === 'confirme' ? 'Confirmé' : (rdv.statut === 'annule' ? 'Annulé' : 'Terminé') }}
                </div>
              </div>
              
              <div class="rdv-card__actions">
                @if (rdv.statut === 'confirme') {
                  <button class="btn btn--outline btn--sm btn-danger" (click)="annuler(rdv.id)" [disabled]="isCancelling()">
                    Annuler
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { max-width: 800px; margin: 0 auto; padding: var(--space-8) var(--space-4); }
    .header-section { margin-bottom: var(--space-8); }
    .page-title { font-size: 2rem; color: var(--color-text-primary); margin-bottom: var(--space-2); }
    .page-subtitle { color: var(--color-text-secondary); }
    
    .loading-state { text-align: center; padding: var(--space-12); color: var(--color-text-secondary); }
    
    .empty-state { text-align: center; padding: var(--space-12); }
    .empty-icon { font-size: 3rem; margin-bottom: var(--space-4); }
    
    .rdv-list { display: flex; flex-direction: column; gap: var(--space-4); }
    .rdv-card { display: flex; gap: var(--space-6); padding: var(--space-6); }
    
    .rdv-card__date { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 100px; padding-right: var(--space-6); border-right: 1px solid var(--color-border); }
    .day { font-size: 2rem; font-weight: 800; color: var(--color-text-primary); line-height: 1; }
    .month { font-size: 1rem; color: var(--color-text-secondary); text-transform: uppercase; font-weight: 600; margin-bottom: var(--space-2); }
    .time { font-size: 1.1rem; color: var(--color-primary); font-weight: 600; background: rgba(99,102,241,0.1); padding: 4px 8px; border-radius: var(--radius-sm); }
    
    .rdv-card__info { flex: 1; }
    .rdv-card__info h3 { font-size: 1.2rem; color: var(--color-text-primary); margin-bottom: 2px; }
    .specialite { color: var(--color-primary); font-weight: 500; font-size: 0.9rem; margin-bottom: var(--space-2); }
    .centre { color: var(--color-text-secondary); font-size: 0.9rem; margin-bottom: var(--space-1); }
    .motif { color: var(--color-text-muted); font-size: 0.85rem; font-style: italic; margin-bottom: var(--space-3); }
    
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; margin-top: var(--space-2); }
    .status-badge--confirme { background: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
    .status-badge--annule { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }
    .status-badge--termine { background: rgba(107, 114, 128, 0.15); color: #9ca3af; border: 1px solid rgba(107, 114, 128, 0.3); }
    
    .rdv-card__actions { display: flex; align-items: center; }
    .btn-danger { color: #ef4444; border-color: rgba(239, 68, 68, 0.5); }
    .btn-danger:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }
    
    @media (max-width: 600px) {
      .rdv-card { flex-direction: column; gap: var(--space-4); }
      .rdv-card__date { border-right: none; border-bottom: 1px solid var(--color-border); padding-right: 0; padding-bottom: var(--space-4); flex-direction: row; gap: var(--space-4); }
    }
  `]
})
export class MesRdvComponent implements OnInit {
  private readonly rdvService = inject(RendezVousService);
  private readonly notificationService = inject(NotificationService);

  readonly rdvs = signal<RendezVous[]>([]);
  readonly isLoading = signal(true);
  readonly isCancelling = signal(false);

  ngOnInit() {
    this.loadRdvs();
  }

  loadRdvs() {
    this.isLoading.set(true);
    this.rdvService.getMesRendezVous().subscribe({
      next: (data) => {
        this.rdvs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  annuler(id: number) {
    if (!confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?')) return;
    
    this.isCancelling.set(true);
    this.rdvService.annulerRendezVous(id).subscribe({
      next: () => {
        this.notificationService.success('Rendez-vous annulé.');
        this.loadRdvs();
        this.isCancelling.set(false);
      },
      error: () => this.isCancelling.set(false)
    });
  }

  getDay(isoStr: string): string {
    return new Date(isoStr).getDate().toString().padStart(2, '0');
  }
  
  getMonth(isoStr: string): string {
    return new Date(isoStr).toLocaleDateString('fr-FR', { month: 'short' });
  }
  
  getTime(isoStr: string): string {
    return new Date(isoStr).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }
}
