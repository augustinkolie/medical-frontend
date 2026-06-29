/**
 * @file absences-admin.component.ts
 * @description Gestion dynamique des absences par l'admin.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AbsencesService } from './absences.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Absence, Medecin, MotifAbsence } from '../../../core/models';

@Component({
  selector: 'app-absences-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar glass-card">
        <h2 class="sidebar-title">Administration</h2>
        <nav class="admin-nav">
          <a routerLink="/admin" class="admin-nav__link"><i class="ph ph-chart-bar"></i> Tableau de bord</a>
          <a routerLink="/admin/rendezvous" class="admin-nav__link"><i class="ph ph-calendar-check"></i> Rendez-vous</a>
          <a routerLink="/admin/medecins" class="admin-nav__link"><i class="ph ph-user-gear"></i> Médecins</a>
          <a routerLink="/admin/absences" class="admin-nav__link active"><i class="ph ph-calendar"></i> Absences</a>
        </nav>
      </aside>
      
      <main class="admin-main">
        <div class="header-section">
          <h1 class="page-title">Gestion des Absences</h1>
          <p class="page-subtitle">Déclarez les congés et indisponibilités des praticiens.</p>
        </div>
        
        <div class="glass-card p-6 mb-6">
           <div class="flex-between mb-4">
              <h3>Déclarer une absence</h3>
              <button class="btn btn--primary btn--sm" (click)="toggleForm()">
                 {{ isFormVisible() ? 'Fermer' : '+ Nouvelle absence' }}
              </button>
           </div>
           
           @if (isFormVisible()) {
             <form [formGroup]="absenceForm" (ngSubmit)="submitAbsence()" class="absence-form">
               <div class="form-grid">
                 <div class="form-group">
                   <label class="form-label">Médecin</label>
                   <select formControlName="medecinId" class="form-input">
                     <option value="">Sélectionner un médecin...</option>
                     @for (med of medecins(); track med.id) {
                       <option [value]="med.id">Dr. {{ med.nom }} {{ med.prenom }} ({{ med.specialite?.nom }})</option>
                     }
                   </select>
                 </div>
                 
                 <div class="form-group">
                   <label class="form-label">Motif</label>
                   <select formControlName="motif" class="form-input">
                     <option value="conges">Congés</option>
                     <option value="maladie">Maladie</option>
                     <option value="formation">Formation</option>
                     <option value="autre">Autre</option>
                   </select>
                 </div>

                 <div class="form-group">
                   <label class="form-label">Date de début</label>
                   <input type="date" formControlName="dateDebut" class="form-input" />
                 </div>

                 <div class="form-group">
                   <label class="form-label">Date de fin</label>
                   <input type="date" formControlName="dateFin" class="form-input" />
                 </div>
               </div>
               
               <div class="form-actions mt-4">
                 <button type="submit" class="btn btn--primary" [disabled]="absenceForm.invalid || isSubmitting()">
                   {{ isSubmitting() ? 'Enregistrement...' : 'Enregistrer l\\'absence' }}
                 </button>
               </div>
             </form>
           }
        </div>
        
        <div class="glass-card p-6">
           <h3 class="mb-4">Historique des absences</h3>
           
           @if (isLoading()) {
              <div class="loading-state"><span class="spinner"></span> Chargement...</div>
           } @else if (absences().length === 0) {
              <div class="empty-state">
                 <span class="empty-icon"><i class="ph ph-calendar-blank"></i></span>
                 <p>Aucune absence enregistrée.</p>
              </div>
           } @else {
              <div class="table-container">
                 <table class="data-table">
                    <thead>
                       <tr>
                          <th>Médecin</th>
                          <th>Motif</th>
                          <th>Début</th>
                          <th>Fin</th>
                          <th class="text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       @for (abs of absences(); track abs.id) {
                          <tr>
                             <td class="font-medium">Dr. {{ abs.medecin?.nom }} {{ abs.medecin?.prenom }}</td>
                             <td>
                                <span class="motif-badge">{{ abs.motif }}</span>
                             </td>
                             <td>{{ formatDate(abs.dateDebut) }}</td>
                             <td>{{ formatDate(abs.dateFin) }}</td>
                             <td class="text-right">
                                <button class="btn btn--sm btn-danger-outline" (click)="deleteAbsence(abs.id)" title="Supprimer l'absence">
                                  <i class="ph ph-trash"></i>
                                </button>
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
    .mb-4 { margin-bottom: var(--space-4); }
    .mt-4 { margin-top: var(--space-4); }
    .flex-between { display: flex; justify-content: space-between; align-items: center; }
    h3 { color: var(--color-text-primary); font-weight: 600; font-size: 1.2rem; }
    
    /* Form */
    .absence-form { background: rgba(99,102,241,0.02); padding: var(--space-6); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); }
    .form-actions { display: flex; justify-content: flex-end; }
    
    /* Table */
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: var(--space-3) var(--space-4); border-bottom: 2px solid var(--color-border); color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .data-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-primary); vertical-align: middle; }
    .data-table tbody tr:hover { background: var(--color-surface-hover); }
    
    .font-medium { font-weight: 500; }
    .text-right { text-align: right; }
    
    .motif-badge { display: inline-block; padding: 4px 8px; border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 600; text-transform: capitalize; background: rgba(99,102,241,0.1); color: var(--color-primary); }
    .btn-danger-outline { color: #ef4444; border: 1px solid #ef4444; background: transparent; padding: 4px 8px; border-radius: var(--radius-sm); cursor: pointer; transition: all 0.2s; }
    .btn-danger-outline:hover { background: #ef4444; color: white; }
    
    .empty-state { text-align: center; padding: var(--space-12); color: var(--color-text-muted); border: 1px dashed var(--color-border); border-radius: var(--radius-md); }
    .empty-icon { font-size: 3rem; display: block; margin-bottom: var(--space-4); opacity: 0.5; }
    .loading-state { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }

    @media (max-width: 768px) {
      .admin-layout { flex-direction: column; padding: var(--space-4); gap: var(--space-4); }
      .admin-sidebar { display: none; }
      .header-section { margin-bottom: var(--space-4); }
      .p-6 { padding: var(--space-4); }
      .form-grid { grid-template-columns: 1fr; }
      .absence-form { padding: var(--space-4); }
      .flex-between { flex-wrap: wrap; gap: var(--space-3); }
      .data-table th, .data-table td { padding: var(--space-2) var(--space-3); font-size: 0.85rem; }
    }
  `]
})
export class AbsencesAdminComponent implements OnInit {
  private readonly absencesService = inject(AbsencesService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly absences = signal<Absence[]>([]);
  readonly medecins = signal<Medecin[]>([]);
  
  readonly isLoading = signal(true);
  readonly isFormVisible = signal(false);
  readonly isSubmitting = signal(false);

  readonly absenceForm = this.fb.nonNullable.group({
    medecinId: ['', Validators.required],
    motif: ['conges', Validators.required],
    dateDebut: ['', Validators.required],
    dateFin: ['', Validators.required]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Load Medecins
    this.absencesService.getAllMedecins().subscribe({
      next: (meds) => this.medecins.set(meds),
      error: () => this.notificationService.error('Erreur lors du chargement des médecins')
    });
    
    // Load Absences
    this.loadAbsences();
  }

  loadAbsences() {
    this.absencesService.getAllAbsences().subscribe({
      next: (data) => {
        this.absences.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des absences');
        this.isLoading.set(false);
      }
    });
  }

  toggleForm() {
    this.isFormVisible.update(v => !v);
    if (!this.isFormVisible()) {
      this.absenceForm.reset({ motif: 'conges' });
    }
  }

  submitAbsence() {
    if (this.absenceForm.invalid) return;

    this.isSubmitting.set(true);
    const formVals = this.absenceForm.getRawValue();
    
    const payload = {
      medecinId: Number(formVals.medecinId),
      motif: formVals.motif as MotifAbsence,
      dateDebut: new Date(formVals.dateDebut).toISOString(),
      dateFin: new Date(formVals.dateFin).toISOString()
    };

    this.absencesService.createAbsence(payload).subscribe({
      next: () => {
        this.notificationService.success('Absence déclarée avec succès !');
        this.isSubmitting.set(false);
        this.toggleForm();
        this.loadAbsences();
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  deleteAbsence(id: number) {
    if (!confirm('Voulez-vous vraiment annuler cette absence ?')) return;

    this.absencesService.deleteAbsence(id).subscribe({
      next: () => {
        this.notificationService.success('Absence annulée.');
        this.loadAbsences();
      }
    });
  }

  formatDate(isoStr: string): string {
    return new Date(isoStr).toLocaleDateString('fr-FR', { 
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  }
}
