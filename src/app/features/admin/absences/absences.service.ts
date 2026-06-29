/**
 * @file absences.service.ts
 * @description Service de l'administration pour gérer les absences des médecins.
 * @module features/admin/absences
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Absence, Medecin, MotifAbsence } from '../../../core/models';

export interface CreateAbsencePayload {
  medecinId: number;
  dateDebut: string;
  dateFin: string;
  motif: MotifAbsence;
}

@Injectable({ providedIn: 'root' })
export class AbsencesService {
  private readonly api = inject(ApiService);

  /**
   * Récupère toutes les absences (Admin).
   */
  getAllAbsences(): Observable<Absence[]> {
    return this.api.get<Absence[]>('/medecins/absences/all');
  }

  /**
   * Crée une nouvelle absence (Admin).
   * @param payload Données de l'absence
   */
  createAbsence(payload: CreateAbsencePayload): Observable<Absence> {
    return this.api.post<Absence>('/medecins/absences', payload);
  }

  /**
   * Supprime une absence (Admin).
   * @param id Identifiant de l'absence
   */
  deleteAbsence(id: number): Observable<null> {
    return this.api.delete<null>(`/medecins/absences/${id}`);
  }

  /**
   * Récupère tous les médecins pour la liste déroulante (Admin).
   */
  getAllMedecins(): Observable<Medecin[]> {
    return this.api.get<Medecin[]>('/medecins');
  }
}
