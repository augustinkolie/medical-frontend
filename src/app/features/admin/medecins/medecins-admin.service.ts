/**
 * @file medecins-admin.service.ts
 * @description Service de l'administration pour gérer les médecins.
 * @module features/admin/medecins
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Medecin, Centre, Specialite, CreateMedecinPayload } from '../../../core/models';

@Injectable({ providedIn: 'root' })
export class MedecinsAdminService {
  private readonly api = inject(ApiService);

  /**
   * Récupère tous les médecins (Admin).
   */
  getAllMedecins(): Observable<Medecin[]> {
    return this.api.get<Medecin[]>('/medecins');
  }

  /**
   * Crée un nouveau médecin (Admin).
   * @param payload Données du médecin
   */
  createMedecin(payload: CreateMedecinPayload): Observable<Medecin> {
    return this.api.post<Medecin>('/medecins', payload);
  }

  /**
   * Supprime un médecin (Admin).
   * @param id Identifiant du médecin
   */
  deleteMedecin(id: number): Observable<null> {
    return this.api.delete<null>(`/medecins/${id}`);
  }

  /**
   * Récupère tous les centres (pour la liste déroulante).
   */
  getAllCentres(): Observable<Centre[]> {
    return this.api.get<Centre[]>('/centres');
  }

  /**
   * Récupère toutes les spécialités (pour la liste déroulante).
   */
  getAllSpecialites(): Observable<Specialite[]> {
    return this.api.get<Specialite[]>('/specialites');
  }
}
