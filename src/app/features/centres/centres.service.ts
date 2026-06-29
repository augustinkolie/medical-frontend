/**
 * @file centres.service.ts
 * @description Service de la feature Centres — accès aux données via ApiService.
 *
 * @module features/centres
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Centre, Specialite, Medecin } from '../../core/models';

/**
 * Service de la feature Centres.
 * Expose les méthodes de récupération des centres, spécialités et médecins.
 */
@Injectable({ providedIn: 'root' })
export class CentresService {
  private readonly api = inject(ApiService);

  /**
   * Récupère la liste de tous les centres médicaux.
   * @returns Observable de la liste des centres
   */
  getAllCentres(): Observable<Centre[]> {
    return this.api.get<Centre[]>('/centres');
  }

  /**
   * Récupère un centre par son identifiant.
   * @param id - Identifiant du centre
   */
  getCentreById(id: number): Observable<Centre> {
    return this.api.get<Centre>(`/centres/${id}`);
  }

  /**
   * Récupère les spécialités disponibles dans un centre.
   * @param centreId - Identifiant du centre
   */
  getSpecialitesByCentre(centreId: number): Observable<Specialite[]> {
    return this.api.get<Specialite[]>(`/centres/${centreId}/specialites`);
  }

  /**
   * Récupère les médecins d'un centre pour une spécialité donnée.
   * @param centreId - Identifiant du centre
   * @param specialiteId - Identifiant de la spécialité
   */
  getMedecinsByCentreAndSpecialite(
    centreId: number,
    specialiteId: number
  ): Observable<Medecin[]> {
    return this.api.get<Medecin[]>(
      `/centres/${centreId}/specialites/${specialiteId}/medecins`
    );
  }
}
