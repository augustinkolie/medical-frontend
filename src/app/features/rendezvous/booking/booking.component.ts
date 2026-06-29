/**
 * @file booking.component.ts
 * @description Flux de prise de rendez-vous en plusieurs étapes (Stepper).
 * @module features/rendezvous/booking
 */

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CentresService } from '../../centres/centres.service';
import { RendezVousService } from '../rendezvous.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Centre, Specialite, Medecin, Creneau } from '../../../core/models';

type Step = 'centre' | 'specialite' | 'medecin' | 'creneau' | 'patient' | 'confirmation';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-container">
      <div class="booking-header">
        <h1 class="page-title">Prendre un rendez-vous</h1>
        <p class="page-subtitle">Suivez les étapes pour réserver votre créneau de consultation.</p>
        
        <!-- Stepper Progress -->
        <div class="stepper">
          @for (stepName of stepNames; track stepName; let i = $index) {
            <div class="step" [class.step--active]="currentStepIndex() === i" [class.step--completed]="currentStepIndex() > i">
              <div class="step__number">{{ i + 1 }}</div>
              <div class="step__label">{{ stepLabels[i] }}</div>
            </div>
            @if (i < stepNames.length - 1) {
              <div class="step__line" [class.step__line--active]="currentStepIndex() > i"></div>
            }
          }
        </div>
      </div>

      <div class="booking-content glass-card">
        <!-- Étape 1 : Choix du Centre -->
        @if (currentStep() === 'centre') {
          <div class="step-pane">
            <h2 class="step-title">1. Choisissez un centre médical</h2>
            @if (isLoadingCentres()) {
              <div class="loading-state"><span class="spinner"></span> Chargement des centres...</div>
            } @else {
              <div class="grid-options">
                @for (centre of centres(); track centre.id) {
                  <button class="option-card" [class.option-card--selected]="selectedCentre()?.id === centre.id" (click)="selectCentre(centre)">
                    <div class="option-icon"><i class="ph ph-hospital"></i></div>
                    <div class="option-details">
                      <h3>{{ centre.nom }}</h3>
                      <p>{{ centre.adresse }}</p>
                    </div>
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Étape 2 : Choix de la spécialité -->
        @if (currentStep() === 'specialite') {
          <div class="step-pane">
            <h2 class="step-title">2. Quelle spécialité recherchez-vous ?</h2>
            @if (isLoadingSpecialites()) {
               <div class="loading-state"><span class="spinner"></span> Chargement des spécialités...</div>
            } @else if (specialites().length === 0) {
              <div class="empty-state">Aucune spécialité disponible dans ce centre.</div>
            } @else {
              <div class="grid-options">
                @for (spec of specialites(); track spec.id) {
                  <button class="option-card" [class.option-card--selected]="selectedSpecialite()?.id === spec.id" (click)="selectSpecialite(spec)">
                    <div class="option-details">
                      <h3>{{ spec.nom }}</h3>
                      <p>{{ spec.description }}</p>
                    </div>
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Étape 3 : Choix du médecin -->
        @if (currentStep() === 'medecin') {
          <div class="step-pane">
            <h2 class="step-title">3. Choisissez votre praticien</h2>
            @if (isLoadingMedecins()) {
               <div class="loading-state"><span class="spinner"></span> Chargement des médecins...</div>
            } @else if (medecins().length === 0) {
              <div class="empty-state">Aucun médecin disponible pour cette spécialité dans ce centre.</div>
            } @else {
              <div class="grid-options">
                @for (med of medecins(); track med.id) {
                  <button class="option-card" [class.option-card--selected]="selectedMedecin()?.id === med.id" (click)="selectMedecin(med)">
                    <div class="option-icon"><i class="ph ph-user-circle"></i></div>
                    <div class="option-details">
                      <h3>Dr. {{ med.prenom }} {{ med.nom }}</h3>
                    </div>
                  </button>
                }
              </div>
            }
          </div>
        }

        <!-- Étape 4 : Choix du créneau -->
        @if (currentStep() === 'creneau') {
          <div class="step-pane">
            <h2 class="step-title">4. Sélectionnez un créneau horaire</h2>
            <div class="date-selector">
              <label for="date-input" class="form-label">Date de consultation</label>
              <input type="date" id="date-input" class="form-input" [ngModel]="selectedDate()" (ngModelChange)="onDateChange($event)" [min]="minDate" />
            </div>

            @if (isLoadingCreneaux()) {
               <div class="loading-state"><span class="spinner"></span> Chargement des disponibilités...</div>
            } @else {
              <div class="slots-grid">
                @for (creneau of creneaux(); track creneau.debut) {
                  <button class="slot-btn" 
                          [class.slot-btn--disabled]="!creneau.disponible"
                          [class.slot-btn--selected]="selectedCreneau()?.debut === creneau.debut"
                          [disabled]="!creneau.disponible"
                          (click)="selectCreneau(creneau)">
                    {{ formatTime(creneau.debut) }}
                  </button>
                }
                @if (creneaux().length === 0) {
                   <div class="empty-state" style="grid-column: 1/-1">Aucun créneau disponible à cette date.</div>
                }
              </div>
            }
          </div>
        }

        <!-- Étape 5 : Informations Patient / Auth Required -->
        @if (currentStep() === 'patient') {
          <div class="step-pane">
            <h2 class="step-title">5. Vos informations</h2>
            
            @if (authService.isAuthenticated()) {
              <form [formGroup]="patientForm" class="patient-form">
                <div class="form-group">
                  <label class="form-label">Nom complet</label>
                  <input type="text" formControlName="nom" class="form-input" placeholder="Jean Dupont" [readonly]="true" />
                </div>
                <div class="form-group">
                  <label class="form-label">Email</label>
                  <input type="email" formControlName="email" class="form-input" placeholder="jean@example.com" [readonly]="true" />
                </div>
                <div class="form-group">
                  <label class="form-label">Motif de consultation (optionnel)</label>
                  <textarea formControlName="motif" class="form-input" rows="3" placeholder="Ex: Bilan annuel..."></textarea>
                </div>
              </form>
            } @else {
              <div class="auth-required-state">
                <div class="auth-icon"><i class="ph ph-lock-key"></i></div>
                <h3>Connexion requise</h3>
                <p>Vous devez être connecté à votre compte patient pour pouvoir valider cette réservation.</p>
                <div class="mt-4">
                  <a class="btn btn--primary" routerLink="/login">Se connecter ou S'inscrire</a>
                </div>
              </div>
            }
          </div>
        }

        <!-- Étape 6 : Confirmation -->
        @if (currentStep() === 'confirmation') {
          <div class="step-pane text-center">
             <div class="success-icon"><i class="ph ph-check-circle" style="color: var(--color-success)"></i></div>
             <h2 class="step-title">Rendez-vous confirmé !</h2>
             <div class="recap-card">
                <p><strong>Centre:</strong> {{ selectedCentre()?.nom }}</p>
                <p><strong>Médecin:</strong> Dr. {{ selectedMedecin()?.nom }} ({{ selectedSpecialite()?.nom }})</p>
                <p><strong>Date:</strong> {{ formatDateTime(selectedCreneau()?.debut) }}</p>
             </div>
             <div class="mt-6">
                <button class="btn btn--primary" routerLink="/">Retour à l'accueil</button>
             </div>
          </div>
        }

        <!-- Actions de navigation -->
        @if (currentStep() !== 'confirmation') {
          <div class="step-actions">
            <button class="btn btn--outline" (click)="goBack()" [disabled]="currentStepIndex() === 0">Précédent</button>
            <button class="btn btn--primary" (click)="goNext()" [disabled]="!canGoNext()">
              {{ currentStep() === 'patient' ? 'Confirmer le rendez-vous' : 'Suivant' }}
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: 800px; margin: 0 auto; padding: var(--space-8) var(--space-4); }
    .booking-header { margin-bottom: var(--space-8); text-align: center; }
    .page-title { font-size: 2rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--space-2); }
    .page-subtitle { color: var(--color-text-secondary); }
    
    /* Stepper */
    .stepper { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-8); padding: 0 var(--space-4); }
    .step { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); position: relative; z-index: 2; }
    .step__number { width: 32px; height: 32px; border-radius: 50%; background: var(--color-surface-elevated); border: 2px solid var(--color-border); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--color-text-muted); transition: all .3s; }
    .step__label { font-size: 0.75rem; color: var(--color-text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
    .step--active .step__number { border-color: var(--color-primary); color: var(--color-primary); background: rgba(99,102,241,0.1); }
    .step--active .step__label { color: var(--color-primary); }
    .step--completed .step__number { background: var(--color-primary); border-color: var(--color-primary); color: white; }
    .step__line { flex: 1; height: 2px; background: var(--color-border); margin: 0 -16px; position: relative; top: -10px; z-index: 1; transition: background .3s; }
    .step__line--active { background: var(--color-primary); }

    /* Content */
    .booking-content { padding: var(--space-8); }
    .step-title { font-size: 1.5rem; font-weight: 600; color: var(--color-text-primary); margin-bottom: var(--space-6); }
    
    /* Options Grid */
    .grid-options { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: var(--space-4); }
    .option-card { display: flex; align-items: center; gap: var(--space-4); padding: var(--space-4); background: var(--color-surface); border: 2px solid transparent; border-radius: var(--radius-md); cursor: pointer; text-align: left; transition: all .2s; color: var(--color-text-primary); }
    .option-card:hover { background: var(--color-surface-hover); }
    .option-card--selected { border-color: var(--color-primary); background: rgba(99,102,241,0.05); }
    .option-icon { font-size: 2rem; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--color-surface-hover); border-radius: var(--radius-md); }
    .option-details h3 { font-size: 1rem; font-weight: 600; margin-bottom: 2px; }
    .option-details p { font-size: 0.85rem; color: var(--color-text-secondary); margin: 0; }

    /* Slots Grid */
    .date-selector { margin-bottom: var(--space-6); max-width: 300px; }
    .slots-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: var(--space-3); }
    .slot-btn { padding: var(--space-3) 0; border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); color: var(--color-text-primary); font-weight: 500; cursor: pointer; transition: all .2s; }
    .slot-btn:hover:not(.slot-btn--disabled) { border-color: var(--color-primary); color: var(--color-primary); }
    .slot-btn--selected { background: var(--color-primary); color: white; border-color: var(--color-primary); }
    .slot-btn--disabled { opacity: 0.5; cursor: not-allowed; background: var(--color-surface-hover); text-decoration: line-through; }

    /* Actions */
    .step-actions { display: flex; justify-content: space-between; margin-top: var(--space-8); padding-top: var(--space-6); border-top: 1px solid var(--color-border); }
    .patient-form { display: flex; flex-direction: column; gap: var(--space-4); max-width: 500px; }
    
    .loading-state, .empty-state { text-align: center; padding: var(--space-8); color: var(--color-text-secondary); }
    .success-icon { font-size: 4rem; margin-bottom: var(--space-4); }
    .recap-card { background: rgba(99,102,241,0.1); padding: var(--space-6); border-radius: var(--radius-md); text-align: left; max-width: 400px; margin: 0 auto; }
    .recap-card p { margin-bottom: var(--space-2); color: var(--color-text-primary); }
    .mt-6 { margin-top: var(--space-6); }
    .mt-4 { margin-top: var(--space-4); }
    
    .auth-required-state { text-align: center; padding: var(--space-8); border: 1px dashed var(--color-border); border-radius: var(--radius-md); background: rgba(99,102,241,0.05); }
    .auth-icon { font-size: 3rem; color: var(--color-primary); margin-bottom: var(--space-4); }
    .auth-required-state h3 { font-size: 1.25rem; font-weight: 600; margin-bottom: var(--space-2); color: var(--color-text-primary); }
    .auth-required-state p { color: var(--color-text-secondary); }
  `]
})
export class BookingComponent implements OnInit {
  private readonly centresService = inject(CentresService);
  private readonly rdvService = inject(RendezVousService);
  readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly stepNames: Step[] = ['centre', 'specialite', 'medecin', 'creneau', 'patient'];
  readonly stepLabels = ['Centre', 'Spécialité', 'Médecin', 'Date', 'Infos'];
  
  readonly currentStep = signal<Step>('centre');
  readonly currentStepIndex = computed(() => this.stepNames.indexOf(this.currentStep()));

  // Data signals
  readonly centres = signal<Centre[]>([]);
  readonly specialites = signal<Specialite[]>([]);
  readonly medecins = signal<Medecin[]>([]);
  readonly creneaux = signal<Creneau[]>([]);

  // Selection signals
  readonly selectedCentre = signal<Centre | null>(null);
  readonly selectedSpecialite = signal<Specialite | null>(null);
  readonly selectedMedecin = signal<Medecin | null>(null);
  readonly selectedDate = signal<string>(new Date().toISOString().split('T')[0]);
  readonly selectedCreneau = signal<Creneau | null>(null);

  // Loading signals
  readonly isLoadingCentres = signal(false);
  readonly isLoadingSpecialites = signal(false);
  readonly isLoadingMedecins = signal(false);
  readonly isLoadingCreneaux = signal(false);
  readonly isSubmitting = signal(false);

  readonly minDate = new Date().toISOString().split('T')[0];

  readonly patientForm = this.fb.nonNullable.group({
    nom: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    motif: ['']
  });

  ngOnInit(): void {
    // Pré-remplir form si auth
    const user = this.authService.currentUser();
    if (user) {
      this.patientForm.patchValue({
        nom: user.prenom && user.nom ? `${user.prenom} ${user.nom}` : (user.nom || ''),
        email: user.email
      });
    }

    this.loadCentres();

    // Check query params
    this.route.queryParams.subscribe(params => {
      const centreId = params['centreId'];
      if (centreId && this.centres().length > 0) {
        const centre = this.centres().find(c => c.id === Number(centreId));
        if (centre) this.selectCentre(centre);
      }
    });
  }

  loadCentres() {
    this.isLoadingCentres.set(true);
    this.centresService.getAllCentres().subscribe({
      next: (data) => {
        this.centres.set(data);
        this.isLoadingCentres.set(false);
        const centreId = this.route.snapshot.queryParams['centreId'];
        if (centreId) {
           const centre = data.find(c => c.id === Number(centreId));
           if (centre) this.selectCentre(centre);
        }
      },
      error: () => this.isLoadingCentres.set(false)
    });
  }

  selectCentre(centre: Centre) {
    this.selectedCentre.set(centre);
    this.selectedSpecialite.set(null);
    this.selectedMedecin.set(null);
    this.selectedCreneau.set(null);
    
    this.isLoadingSpecialites.set(true);
    this.centresService.getSpecialitesByCentre(centre.id).subscribe({
      next: (data) => {
        this.specialites.set(data);
        this.isLoadingSpecialites.set(false);
      },
      error: () => this.isLoadingSpecialites.set(false)
    });
  }

  selectSpecialite(spec: Specialite) {
    this.selectedSpecialite.set(spec);
    this.selectedMedecin.set(null);
    this.selectedCreneau.set(null);

    if (this.selectedCentre()) {
      this.isLoadingMedecins.set(true);
      this.centresService.getMedecinsByCentreAndSpecialite(this.selectedCentre()!.id, spec.id).subscribe({
        next: (data) => {
          this.medecins.set(data);
          this.isLoadingMedecins.set(false);
        },
        error: () => this.isLoadingMedecins.set(false)
      });
    }
  }

  selectMedecin(med: Medecin) {
    this.selectedMedecin.set(med);
    this.selectedCreneau.set(null);
    this.loadCreneaux();
  }

  onDateChange(date: string) {
    this.selectedDate.set(date);
    this.selectedCreneau.set(null);
    if (this.selectedMedecin()) {
      this.loadCreneaux();
    }
  }

  loadCreneaux() {
    if (!this.selectedMedecin()) return;
    this.isLoadingCreneaux.set(true);
    this.rdvService.getCreneaux(this.selectedMedecin()!.id, this.selectedDate()).subscribe({
      next: (data) => {
        this.creneaux.set(data);
        this.isLoadingCreneaux.set(false);
      },
      error: () => this.isLoadingCreneaux.set(false)
    });
  }

  selectCreneau(creneau: Creneau) {
    this.selectedCreneau.set(creneau);
  }

  canGoNext(): boolean {
    switch (this.currentStep()) {
      case 'centre': return !!this.selectedCentre();
      case 'specialite': return !!this.selectedSpecialite();
      case 'medecin': return !!this.selectedMedecin();
      case 'creneau': return !!this.selectedCreneau();
      case 'patient': return this.authService.isAuthenticated() && this.patientForm.valid;
      default: return false;
    }
  }

  goNext() {
    if (!this.canGoNext()) return;

    const idx = this.currentStepIndex();
    if (idx < this.stepNames.length - 1) {
      this.currentStep.set(this.stepNames[idx + 1]);
    } else if (this.currentStep() === 'patient') {
      this.submitBooking();
    }
  }

  goBack() {
    const idx = this.currentStepIndex();
    if (idx > 0) {
      this.currentStep.set(this.stepNames[idx - 1]);
    }
  }

  submitBooking() {
    if (this.patientForm.invalid || !this.selectedMedecin() || !this.selectedCentre() || !this.selectedCreneau()) return;
    
    this.isSubmitting.set(true);
    const formVals = this.patientForm.getRawValue();
    
    this.rdvService.createRendezVous({
      patientNom: formVals.nom,
      patientEmail: formVals.email,
      motifConsult: formVals.motif,
      medecinId: this.selectedMedecin()!.id,
      centreId: this.selectedCentre()!.id,
      dateHeure: this.selectedCreneau()!.debut
    }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.notificationService.success('Rendez-vous confirmé !');
        this.currentStep.set('confirmation');
      },
      error: () => {
        this.isSubmitting.set(false);
      }
    });
  }

  formatTime(isoString?: string): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  formatDateTime(isoString?: string): string {
    if (!isoString) return '';
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  }
}
