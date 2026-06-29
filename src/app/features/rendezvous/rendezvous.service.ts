/**
 * @file rendezvous.service.ts
 * @description Service de la feature RendezVous — création et gestion des RDV.
 *
 * @module features/rendezvous
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Creneau, RendezVous, CreateRendezVousPayload } from '../../core/models';

/**
 * Service de la feature RendezVous.
 */
@Injectable({ providedIn: 'root' })
export class RendezVousService {
  private readonly api = inject(ApiService);

  /**
   * Récupère les créneaux disponibles pour un médecin à une date.
   * @param medecinId - Identifiant du médecin
   * @param date - Date au format "YYYY-MM-DD"
   */
  getCreneaux(medecinId: number, date: string): Observable<Creneau[]> {
    return this.api.get<Creneau[]>(`/medecins/${medecinId}/creneaux`, { date });
  }

  /**
   * Crée un nouveau rendez-vous.
   * @param payload - Données du RDV
   */
  createRendezVous(payload: CreateRendezVousPayload): Observable<RendezVous> {
    return this.api.post<RendezVous>('/rendezvous', payload);
  }

  /**
   * Récupère les RDV de l'utilisateur connecté.
   */
  getMesRendezVous(): Observable<RendezVous[]> {
    return this.api.get<RendezVous[]>('/rendezvous/mes-rdv');
  }

  /**
   * Récupère TOUS les rendez-vous de l'application (Admin).
   */
  getAllRendezVous(): Observable<RendezVous[]> {
    return this.api.get<RendezVous[]>('/rendezvous');
  }

  /**
   * Annule un rendez-vous.
   * @param id - Identifiant du RDV
   */
  annulerRendezVous(id: number): Observable<null> {
    return this.api.patch<null>(`/rendezvous/${id}/annuler`, {});
  }

  /**
   * Confirme un rendez-vous (Admin).
   * @param id - Identifiant du RDV
   */
  confirmerRendezVous(id: number): Observable<null> {
    return this.api.patch<null>(`/rendezvous/${id}/confirmer`, {});
  }
}
