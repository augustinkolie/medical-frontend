/**
 * @file medecins-admin.component.ts
 * @description Gestion dynamique des médecins par l'admin.
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MedecinsAdminService } from './medecins-admin.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Medecin, Centre, Specialite } from '../../../core/models';

@Component({
  selector: 'app-medecins-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  template: `
    <div class="admin-layout">
      <aside class="admin-sidebar glass-card">
        <h2 class="sidebar-title">Administration</h2>
        <nav class="admin-nav">
          <a routerLink="/admin" class="admin-nav__link"><i class="ph ph-chart-bar"></i> Tableau de bord</a>
          <a routerLink="/admin/rendezvous" class="admin-nav__link"><i class="ph ph-calendar-check"></i> Rendez-vous</a>
          <a routerLink="/admin/medecins" class="admin-nav__link active"><i class="ph ph-user-gear"></i> Médecins</a>
          <a routerLink="/admin/absences" class="admin-nav__link"><i class="ph ph-calendar"></i> Absences</a>
        </nav>
      </aside>
      
      <main class="admin-main">
        <div class="header-section">
          <h1 class="page-title">Gestion des Médecins</h1>
          <p class="page-subtitle">Ajoutez, modifiez ou supprimez des praticiens.</p>
        </div>
        
        <div class="glass-card p-6 mb-6">
           <div class="flex-between mb-4">
              <h3>Ajouter un médecin</h3>
              <button class="btn btn--primary btn--sm" (click)="toggleForm()">
                 {{ isFormVisible() ? 'Fermer' : '+ Ajouter un médecin' }}
              </button>
           </div>
           
           @if (isFormVisible()) {
             <form [formGroup]="medecinForm" (ngSubmit)="submitMedecin()" class="medecin-form">
               <div class="form-grid">
                 <div class="form-group">
                   <label class="form-label">Nom</label>
                   <input type="text" formControlName="nom" class="form-input" placeholder="Ex: Diallo" />
                 </div>
                 
                 <div class="form-group">
                   <label class="form-label">Prénom</label>
                   <input type="text" formControlName="prenom" class="form-input" placeholder="Ex: Mamadou" />
                 </div>

                 <div class="form-group">
                   <label class="form-label">Email</label>
                   <input type="email" formControlName="email" class="form-input" placeholder="Ex: dr.diallo@medirdv.com" />
                 </div>

                 <div class="form-group">
                   <label class="form-label">Téléphone</label>
                   <input type="tel" formControlName="telephone" class="form-input" placeholder="Ex: +224 620 00 00 00" />
                 </div>

                 <div class="form-group">
                   <label class="form-label">Centre d'affectation</label>
                   <select formControlName="centreId" class="form-input">
                     <option value="">Sélectionner un centre...</option>
                     @for (centre of centres(); track centre.id) {
                       <option [value]="centre.id">{{ centre.nom }}</option>
                     }
                   </select>
                 </div>

                 <div class="form-group">
                   <label class="form-label">Spécialité</label>
                   <select formControlName="specialiteId" class="form-input">
                     <option value="">Sélectionner une spécialité...</option>
                     @for (spec of specialites(); track spec.id) {
                       <option [value]="spec.id">{{ spec.nom }}</option>
                     }
                   </select>
                 </div>
               </div>
               
               <div class="form-actions mt-4">
                 <button type="submit" class="btn btn--primary" [disabled]="medecinForm.invalid || isSubmitting()">
                   {{ isSubmitting() ? 'Enregistrement...' : 'Enregistrer le médecin' }}
                 </button>
               </div>
             </form>
           }
        </div>
        
        <div class="glass-card p-6">
           <h3 class="mb-4">Liste des médecins</h3>
           
           @if (isLoading()) {
              <div class="loading-state"><span class="spinner"></span> Chargement...</div>
           } @else if (medecins().length === 0) {
              <div class="empty-state">
                 <span class="empty-icon"><i class="ph ph-users"></i></span>
                 <p>Aucun médecin enregistré.</p>
              </div>
           } @else {
              <div class="table-container">
                 <table class="data-table">
                    <thead>
                       <tr>
                          <th>Médecin</th>
                          <th>Spécialité</th>
                          <th>Centre</th>
                          <th>Contact</th>
                          <th class="text-right">Actions</th>
                       </tr>
                    </thead>
                    <tbody>
                       @for (med of medecins(); track med.id) {
                          <tr>
                             <td class="font-medium">Dr. {{ med.nom }} {{ med.prenom }}</td>
                             <td><span class="badge badge-primary">{{ med.specialite?.nom }}</span></td>
                             <td>{{ med.centre?.nom }}</td>
                             <td>
                                <div class="text-sm">{{ med.email }}</div>
                                <div class="text-xs text-muted">{{ med.telephone }}</div>
                             </td>
                             <td class="text-right">
                                <button class="btn btn--sm btn-danger-outline" (click)="deleteMedecin(med.id)" title="Supprimer le médecin">
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
    .medecin-form { background: rgba(99,102,241,0.02); padding: var(--space-6); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: var(--space-4); }
    .form-actions { display: flex; justify-content: flex-end; }
    
    /* Table */
    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; text-align: left; }
    .data-table th { padding: var(--space-3) var(--space-4); border-bottom: 2px solid var(--color-border); color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
    .data-table td { padding: var(--space-4); border-bottom: 1px solid var(--color-border); color: var(--color-text-primary); vertical-align: middle; }
    .data-table tbody tr:hover { background: var(--color-surface-hover); }
    
    .font-medium { font-weight: 500; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .text-muted { color: var(--color-text-muted); }
    .text-right { text-align: right; }
    
    .badge { display: inline-block; padding: 4px 8px; border-radius: var(--radius-md); font-size: 0.75rem; font-weight: 600; }
    .badge-primary { background: rgba(99,102,241,0.1); color: var(--color-primary); }
    
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
      .medecin-form { padding: var(--space-4); }
      .flex-between { flex-wrap: wrap; gap: var(--space-3); }
      .data-table th, .data-table td { padding: var(--space-2) var(--space-3); font-size: 0.85rem; }
    }
  `]
})
export class MedecinsAdminComponent implements OnInit {
  private readonly medecinsService = inject(MedecinsAdminService);
  private readonly notificationService = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly medecins = signal<Medecin[]>([]);
  readonly centres = signal<Centre[]>([]);
  readonly specialites = signal<Specialite[]>([]);
  
  readonly isLoading = signal(true);
  readonly isFormVisible = signal(false);
  readonly isSubmitting = signal(false);

  readonly medecinForm = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    prenom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    centreId: ['', Validators.required],
    specialiteId: ['', Validators.required]
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Charger les centres et spécialités pour le formulaire
    this.medecinsService.getAllCentres().subscribe(res => this.centres.set(res));
    this.medecinsService.getAllSpecialites().subscribe(res => this.specialites.set(res));
    
    // Charger la liste des médecins
    this.loadMedecins();
  }

  loadMedecins() {
    this.medecinsService.getAllMedecins().subscribe({
      next: (data) => {
        this.medecins.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des médecins');
        this.isLoading.set(false);
      }
    });
  }

  toggleForm() {
    this.isFormVisible.update(v => !v);
    if (!this.isFormVisible()) {
      this.medecinForm.reset();
    }
  }

  submitMedecin() {
    if (this.medecinForm.invalid) return;

    this.isSubmitting.set(true);
    const formVals = this.medecinForm.getRawValue();
    
    const payload = {
      nom: formVals.nom,
      prenom: formVals.prenom,
      email: formVals.email,
      telephone: formVals.telephone,
      centreId: Number(formVals.centreId),
      specialiteId: Number(formVals.specialiteId)
    };

    this.medecinsService.createMedecin(payload).subscribe({
      next: () => {
        this.notificationService.success('Médecin ajouté avec succès !');
        this.isSubmitting.set(false);
        this.toggleForm();
        this.loadMedecins();
      },
      error: () => {
        this.notificationService.error("Erreur lors de l'ajout du médecin");
        this.isSubmitting.set(false);
      }
    });
  }

  deleteMedecin(id: number) {
    if (!confirm('Voulez-vous vraiment supprimer ce médecin ?')) return;

    this.medecinsService.deleteMedecin(id).subscribe({
      next: () => {
        this.notificationService.success('Médecin supprimé.');
        this.loadMedecins();
      },
      error: () => {
        this.notificationService.error('Erreur lors de la suppression.');
      }
    });
  }
}
