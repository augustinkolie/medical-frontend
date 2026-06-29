/**
 * @file login.component.ts
 * @description Page de connexion MediRDV avec formulaire réactif.
 *
 * @module features/auth/login
 */

import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Composant de connexion.
 * Gère le formulaire de connexion et redirige selon le rôle après succès.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <section class="auth-page">
      <div class="auth-card glass-card">
        <!-- En-tête -->
        <div class="auth-card__header">
          <div class="auth-card__icon"><i class="ph ph-lock-key" style="color: var(--color-primary);"></i></div>
          <h1 class="auth-card__title">Connexion</h1>
          <p class="auth-card__subtitle">Accédez à votre espace MediRDV</p>
        </div>

        <!-- Formulaire -->
        <form
          [formGroup]="loginForm"
          (ngSubmit)="onSubmit()"
          class="auth-card__form"
          novalidate
        >
          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">Adresse email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-input"
              [class.form-input--error]="emailInvalid"
              placeholder="votre@email.com"
              autocomplete="email"
              aria-describedby="email-error"
            />
            @if (emailInvalid) {
              <span id="email-error" class="form-error" role="alert">
                Adresse email invalide
              </span>
            }
          </div>

          <!-- Mot de passe -->
          <div class="form-group">
            <label for="password" class="form-label">Mot de passe</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="form-input"
              [class.form-input--error]="passwordInvalid"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            @if (passwordInvalid) {
              <span class="form-error" role="alert">
                Le mot de passe est requis
              </span>
            }
          </div>

          <!-- Bouton de connexion -->
          <button
            type="submit"
            class="btn btn--primary btn--full"
            [disabled]="isLoading()"
            [class.btn--loading]="isLoading()"
            id="submit-login"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Connexion en cours...
            } @else {
              Se connecter
            }
          </button>
        </form>

        <!-- Comptes de test -->
        <div class="auth-card__demo">
          <p class="demo-label">Comptes de démonstration :</p>
          <div class="demo-accounts">
            <button class="demo-btn" (click)="fillDemo('admin')" type="button">
              <i class="ph ph-shield-checkered"></i> Admin
            </button>
            <button class="demo-btn" (click)="fillDemo('patient')" type="button">
              <i class="ph ph-user"></i> Patient
            </button>
          </div>
        </div>

        <!-- Lien retour -->
        <p class="auth-card__footer">
          <a routerLink="/" class="link">← Retour à l'accueil</a>
        </p>
      </div>
    </section>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6);
      background: var(--gradient-bg);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      padding: var(--space-10);
    }

    .auth-card__header { text-align: center; margin-bottom: var(--space-8); }

    .auth-card__icon { font-size: 3rem; margin-bottom: var(--space-4); }

    .auth-card__title {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-2);
    }

    .auth-card__subtitle { color: var(--color-text-secondary); font-size: 0.9rem; }

    .auth-card__form { display: flex; flex-direction: column; gap: var(--space-5); }

    .auth-card__demo {
      margin-top: var(--space-6);
      padding-top: var(--space-6);
      border-top: 1px solid var(--color-border);
    }

    .demo-label {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      text-align: center;
      margin-bottom: var(--space-3);
    }

    .demo-accounts { display: flex; gap: var(--space-3); }

    .demo-btn {
      flex: 1;
      padding: var(--space-2) var(--space-3);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      color: var(--color-text-secondary);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .demo-btn:hover { background: rgba(99,102,241,0.15); color: var(--color-primary); border-color: var(--color-primary); }

    .auth-card__footer { text-align: center; margin-top: var(--space-5); }
  `],
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Signal de chargement pour l'état du bouton */
  readonly isLoading = signal(false);

  /** Formulaire réactif de connexion */
  readonly loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  get emailInvalid(): boolean {
    const ctrl = this.loginForm.get('email')!;
    return ctrl.invalid && ctrl.touched;
  }

  get passwordInvalid(): boolean {
    const ctrl = this.loginForm.get('password')!;
    return ctrl.invalid && ctrl.touched;
  }

  /**
   * Soumet le formulaire de connexion.
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (result) => {
        this.notificationService.success(`Bienvenue ${result.user.prenom ?? result.user.email} !`);

        // Redirige vers l'URL cible ou selon le rôle
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        const redirectTo = returnUrl ?? (result.user.role === 'admin' ? '/admin' : '/');
        this.router.navigateByUrl(redirectTo);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Remplit le formulaire avec les identifiants de démonstration.
   */
  fillDemo(role: 'admin' | 'patient'): void {
    const creds = {
      admin: { email: 'admin@medirdv.com', password: 'Admin@1234' },
      patient: { email: 'patient@medirdv.com', password: 'Patient@1234' },
    };
    this.loginForm.patchValue(creds[role]);
  }
}
