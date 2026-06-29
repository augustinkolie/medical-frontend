/**
 * @file auth.service.ts
 * @description Service d'authentification — gestion de l'état via Angular Signals.
 *
 * Utilise les **Angular Signals** (Angular 17+) pour un état réactif et performant.
 *
 * @module core/services
 */

import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { AuthState, LoginPayload, LoginResult, Utilisateur } from '../models';

/** Clé de stockage du token JWT dans localStorage */
const TOKEN_KEY = 'medirdv_access_token';
/** Clé de stockage des données utilisateur dans localStorage */
const USER_KEY = 'medirdv_user';

/**
 * Service d'authentification avec gestion d'état par signals.
 * Exposé via `providedIn: 'root'` — singleton dans toute l'application.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  // ─── État réactif (Signals) ───────────────────────────────────────────────

  /**
   * Signal privé contenant l'état d'authentification.
   * Initialisé depuis localStorage pour persister la session entre les rechargements.
   */
  private readonly _authState = signal<AuthState>(this.loadInitialState());

  /**
   * Signal public en lecture seule — état d'authentification.
   * @example
   * const isAuth = this.authService.authState().isAuthenticated;
   */
  readonly authState = this._authState.asReadonly();

  /** Signal dérivé — utilisateur connecté ou null */
  readonly currentUser = computed(() => this._authState().user);

  /** Signal dérivé — true si l'utilisateur est connecté */
  readonly isAuthenticated = computed(() => this._authState().isAuthenticated);

  /** Signal dérivé — true si l'utilisateur est admin */
  readonly isAdmin = computed(() => this._authState().user?.role === 'admin');

  // ─── Méthodes publiques ───────────────────────────────────────────────────

  /**
   * Authentifie l'utilisateur et met à jour l'état.
   *
   * @param credentials - Email et mot de passe
   * @returns Observable du résultat de connexion
   */
  login(credentials: LoginPayload): Observable<LoginResult> {
    return this.api.post<LoginResult>('/auth/login', credentials).pipe(
      tap((result) => {
        this.setAuthState(result.accessToken, result.user);
      })
    );
  }

  /**
   * Déconnecte l'utilisateur — vide l'état et redirige vers /connexion.
   */
  logout(): void {
    this.clearAuthState();
    this.router.navigate(['/connexion']);
  }

  /**
   * Retourne le token JWT stocké (pour l'intercepteur HTTP).
   * @returns Token JWT ou null si non connecté
   */
  getToken(): string | null {
    return this._authState().token;
  }

  // ─── Méthodes privées ─────────────────────────────────────────────────────

  /**
   * Met à jour l'état d'authentification et persiste en localStorage.
   */
  private setAuthState(token: string, user: Utilisateur): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._authState.set({ isAuthenticated: true, token, user });
  }

  /**
   * Vide l'état d'authentification et nettoie localStorage.
   */
  private clearAuthState(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._authState.set({ isAuthenticated: false, token: null, user: null });
  }

  /**
   * Charge l'état initial depuis localStorage (persistance de session).
   */
  private loadInitialState(): AuthState {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as Utilisateur;
        return { isAuthenticated: true, token, user };
      } catch {
        return { isAuthenticated: false, token: null, user: null };
      }
    }
    return { isAuthenticated: false, token: null, user: null };
  }
}


