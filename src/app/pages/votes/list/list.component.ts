import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MaterialModule } from 'src/app/material.module';

import { Annotation } from 'src/app/models/annotation';

import { VoteMapComponent } from '../components/vote-map/vote-map.component';
import { VoteFacadeService } from '../services/vote-facade.service';
import { VoteWithAnnotation } from '../types/vote-view.types';

@Component({
  selector: 'app-votes-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    VoteMapComponent
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {

  currentCitizenId: number | null = null;

  items: VoteWithAnnotation[] = [];
  selectedItem: VoteWithAnnotation | null = null;

  loading = false;
  error = '';

  get annotationsForMap(): Annotation[] {
    return this.items
      .map(item => item.annotation)
      .filter((annotation): annotation is Annotation => annotation != null);
  }

  constructor(
    private voteFacade: VoteFacadeService
  ) {}

  ngOnInit(): void {
    this.loadCurrentCitizenAndVotes();
  }

  private loadCurrentCitizenAndVotes(): void {
    this.loading = true;
    this.error = '';

    this.voteFacade.getCurrentCitizenId().subscribe({
      next: (idCitizen) => {
        this.currentCitizenId = idCitizen;
        this.loadVotes(idCitizen);
      },
      error: (error) => {
        console.error(error);
        this.error = 'No se pudo identificar el ciudadano autenticado.';
        this.loading = false;
      }
    });
  }

  private loadVotes(idCitizen: number): void {
    this.voteFacade.getCitizenVotesWithAnnotations(idCitizen).subscribe({
      next: (items) => {
        this.items = items;
        this.selectedItem = items[0] ?? null;
        this.loading = false;
      },
      error: () => {
        this.items = [];
        this.error = 'No se pudieron cargar tus votaciones.';
        this.loading = false;
      }
    });
  }

  selectItem(item: VoteWithAnnotation): void {
    this.selectedItem = item;
  }

  selectAnnotationFromMap(annotation: Annotation): void {
    const found = this.items.find(
      item => item.annotation?.id_annotation === annotation.id_annotation
    );

    if (found) {
      this.selectedItem = found;
    }
  }
}
