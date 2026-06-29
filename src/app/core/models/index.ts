/**
 * @file index.ts
 * @description Modèles TypeScript du domaine MediRDV.
 *
 * Ce fichier centralise toutes les interfaces de données utilisées
 * dans l'application Angular. Elles correspondent exactement aux
 * entités retournées par l'API backend.
 *
 * @module core/models
 */

// ─── Entités Domaine ──────────────────────────────────────────────────────────

/**
 * Centre médical (clinique, hôpital, cabinet)
 */
export interface Centre {
  id: number;
  nom: string;
  adresse: string;
  contact: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Spécialité médicale (cardiologie, pédiatrie, etc.)
 */
export interface Specialite {
  id: number;
  nom: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Médecin avec ses relations centre et spécialité
 */
export interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  centreId: number;
  specialiteId: number;
  centre: Centre;
  specialite: Specialite;
  createdAt: string;
  updatedAt: string;
}

/**
 * Absence d'un médecin
 */
export interface Absence {
  id: number;
  medecinId: number;
  medecin: Medecin;
  dateDebut: string;
  dateFin: string;
  motif: MotifAbsence;
  createdAt: string;
}

/**
 * Rendez-vous médical avec ses relations
 */
export interface RendezVous {
  id: number;
  patientNom: string;
  patientEmail: string;
  medecinId: number;
  centreId: number;
  dateHeure: string;
  statut: StatutRdv;
  motifConsult?: string;
  medecin: Medecin;
  centre: Centre;
  createdAt: string;
  updatedAt: string;
}

/**
 * Utilisateur authentifié
 */
export interface Utilisateur {
  id: number;
  email: string;
  nom?: string;
  prenom?: string;
  role: RoleUser;
  createdAt: string;
}

/**
 * Créneau horaire pour la prise de RDV
 */
export interface Creneau {
  debut: string;
  fin: string;
  disponible: boolean;
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export type MotifAbsence = 'maladie' | 'conges' | 'formation' | 'autre';
export type StatutRdv = 'confirme' | 'annule' | 'termine';
export type RoleUser = 'admin' | 'patient';

// ─── DTOs (Data Transfer Objects) ────────────────────────────────────────────

/**
 * Payload pour la création d'un rendez-vous
 */
export interface CreateRendezVousPayload {
  patientNom: string;
  patientEmail: string;
  medecinId: number;
  centreId: number;
  dateHeure: string;
  motifConsult?: string;
}

/**
 * Payload pour la création d'un médecin
 */
export interface CreateMedecinPayload {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  centreId: number;
  specialiteId: number;
}

/**
 * Payload de connexion
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Résultat de la connexion retourné par l'API
 */
export interface LoginResult {
  accessToken: string;
  user: Utilisateur;
}

// ─── Réponses API ─────────────────────────────────────────────────────────────

/**
 * Structure générique des réponses succès de l'API.
 * @template T Type des données
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
  meta?: { total: number; page?: number };
}

/**
 * Structure des réponses erreur de l'API.
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  statusCode: number;
  details?: unknown;
}

// ─── État de l'authentification ───────────────────────────────────────────────

/**
 * État de l'authentification stocké dans le signal Angular.
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: Utilisateur | null;
  token: string | null;
}
