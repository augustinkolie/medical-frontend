/**
 * @file centres-list.component.ts
 * @description Page d'accueil — liste des centres médicaux.
 * @module features/centres/centres-list
 */

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CentresService } from '../centres.service';
import { ApiService } from '../../../core/services/api.service';
import { Centre, Medecin, Specialite } from '../../../core/models';

@Component({
  selector: 'app-centres-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="home-wrapper">
      <section class="hero">
        <div class="hero__container">
          <div class="hero__badge"><i class="ph ph-heartbeat"></i> Santé en ligne</div>
          <h1 class="hero__title">Prenez vos rendez-vous<br /><span class="gradient-text">médicaux en ligne</span></h1>
          <p class="hero__subtitle">Choisissez votre centre, votre spécialité et réservez votre créneau en quelques clics.</p>
          <a routerLink="/reserver" class="btn btn--primary btn--lg" id="cta-reserver">Prendre un rendez-vous →</a>
          <div class="hero__stats">
            <div class="stat"><span class="stat__value">{{ centres().length }}</span><span class="stat__label">Centres</span></div>
            <div class="stat"><span class="stat__value">{{ medecinsCount() > 0 ? medecinsCount() : '...' }}</span><span class="stat__label">Médecins</span></div>
            <div class="stat"><span class="stat__value">{{ specialitesCount() > 0 ? specialitesCount() : '...' }}</span><span class="stat__label">Spécialités</span></div>
          </div>
        </div>
      </section>

      <div class="page-container">
        <section class="centres-section" aria-labelledby="centres-title">
          <h2 class="section-title" id="centres-title">Nos centres médicaux</h2>
          <p class="section-subtitle">Sélectionnez un centre proche de vous.</p>

          @if (isLoading()) {
            <div class="centres-grid">
              @for (i of [1,2,3,4,5,6]; track i) {
                <div class="centre-card skeleton"></div>
              }
            </div>
          } @else {
            <div class="centres-grid">
              @for (centre of centres(); track centre.id) {
                <article class="centre-card glass-card" [id]="'centre-' + centre.id">
                  <div class="centre-card__icon"><i class="ph ph-hospital"></i></div>
                  <h3 class="centre-card__name">{{ centre.nom }}</h3>
                  <p class="centre-card__address"><i class="ph ph-map-pin"></i> {{ centre.adresse }}</p>
                  <p class="centre-card__contact"><i class="ph ph-phone"></i> {{ centre.contact }}</p>
                  <a routerLink="/reserver" [queryParams]="{ centreId: centre.id }"
                     class="btn btn--primary btn--full"
                     [attr.aria-label]="'Réserver au ' + centre.nom">
                    Choisir ce centre
                  </a>
                </article>
              }
            </div>
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page-container { max-width: var(--max-width); margin: 0 auto; padding: var(--space-8) var(--space-6); }
    .hero { 
      text-align: center; 
      padding: calc(var(--space-16) * 1.5) 0 var(--space-16); 
      background-image: linear-gradient(to bottom, rgba(248, 250, 252, 0.2), rgba(248, 250, 252, 0.8)), url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80'); 
      background-size: cover; 
      background-position: center; 
      width: 100%;
      border-bottom: 1px solid var(--color-border);
    }
    .hero__container { max-width: var(--max-width); margin: 0 auto; padding: 0 var(--space-6); }
    .hero__badge { display: inline-flex; align-items: center; gap: 6px; padding: var(--space-2) var(--space-4); background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); border-radius: 0; font-size: .85rem; color: var(--color-primary-light); margin-bottom: var(--space-6); }
    .hero__title { font-size: clamp(2.5rem,6vw,4rem); font-weight: 800; color: var(--color-text-primary); line-height: 1.1; letter-spacing: -.03em; margin-bottom: var(--space-6); }
    .gradient-text { background: var(--gradient-primary); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .hero__subtitle { font-size: 1.1rem; color: var(--color-text-secondary); max-width: 520px; margin: 0 auto var(--space-8); line-height: 1.7; }
    .hero__stats { display: flex; justify-content: center; gap: var(--space-12); margin-top: var(--space-12); }
    .stat { text-align: center; }
    .stat__value { display: block; font-size: 2.5rem; font-weight: 800; color: var(--color-primary); line-height: 1; }
    .stat__label { font-size: .85rem; color: var(--color-text-muted); }
    .centres-section { padding-bottom: var(--space-16); }
    .section-title { font-size: 1.75rem; font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--space-2); }
    .section-subtitle { color: var(--color-text-secondary); margin-bottom: var(--space-8); }
    .centres-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-5); }
    .centre-card { padding: var(--space-6); display: flex; flex-direction: column; gap: var(--space-3); transition: transform .2s; }
    .centre-card:hover { transform: translateY(-4px); }
    .centre-card.skeleton { height: 220px; background: linear-gradient(90deg, rgba(0,0,0,.04) 25%, rgba(0,0,0,.08) 50%, rgba(0,0,0,.04) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .centre-card__icon { font-size: 2rem; }
    .centre-card__name { font-size: 1.05rem; font-weight: 600; color: var(--color-text-primary); }
    .centre-card__address, .centre-card__contact { font-size: .85rem; color: var(--color-text-secondary); }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `],
})
export class CentresListComponent implements OnInit {
  private readonly centresService = inject(CentresService);
  private readonly api = inject(ApiService);
  
  readonly centres = signal<Centre[]>([]);
  readonly isLoading = signal(true);
  
  readonly medecinsCount = signal<number>(0);
  readonly specialitesCount = signal<number>(0);

  ngOnInit(): void {
    this.centresService.getAllCentres().subscribe({
      next: (c) => { this.centres.set(c); this.isLoading.set(false); },
      error: () => this.isLoading.set(false),
    });

    this.api.get<Medecin[]>('/medecins').subscribe({
      next: (m) => this.medecinsCount.set(m.length)
    });

    this.api.get<Specialite[]>('/specialites').subscribe({
      next: (s) => this.specialitesCount.set(s.length)
    });
  }
}
