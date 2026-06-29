/**
 * @file api.service.ts
 * @description Service HTTP de base — couche d'abstraction sur Angular HttpClient.
 *
 * @module core/services
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiSuccessResponse } from '../models';
import { environment } from '../../../environments/environment';

/**
 * Service HTTP centralisé.
 * Préfixe automatiquement toutes les URL avec `environment.apiUrl`.
 * Retourne uniquement les données (`data`) de la réponse API.
 *
 * @example
 * // Dans un feature service
 * constructor(private api: ApiService) {}
 *
 * getCentres(): Observable<Centre[]> {
 *   return this.api.get<Centre[]>('/centres');
 * }
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /**
   * Effectue une requête GET et retourne les données de la réponse.
   *
   * @template T - Type des données attendues
   * @param path - Chemin de l'endpoint (ex: '/centres')
   * @param params - Paramètres de query string optionnels
   * @returns Observable des données de type T
   */
  get<T>(path: string, params?: Record<string, string>): Observable<T> {
    const httpParams = params
      ? new HttpParams({ fromObject: params })
      : undefined;

    return this.http
      .get<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, {
        params: httpParams,
      })
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Effectue une requête POST.
   *
   * @template T - Type de la réponse
   * @param path - Chemin de l'endpoint
   * @param body - Corps de la requête
   */
  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, body)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Effectue une requête PATCH (mise à jour partielle).
   *
   * @template T - Type de la réponse
   * @param path - Chemin de l'endpoint
   * @param body - Champs à modifier
   */
  patch<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .patch<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`, body)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Effectue une requête DELETE.
   *
   * @template T - Type de la réponse
   * @param path - Chemin de l'endpoint
   */
  delete<T>(path: string): Observable<T> {
    return this.http
      .delete<ApiSuccessResponse<T>>(`${this.baseUrl}${path}`)
      .pipe(
        map((response) => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Gestion centralisée des erreurs HTTP.
   * Retransmet l'erreur après log — le ErrorInterceptor prend le relais.
   */
  private handleError = (error: unknown): Observable<never> => {
    return throwError(() => error);
  };
}
