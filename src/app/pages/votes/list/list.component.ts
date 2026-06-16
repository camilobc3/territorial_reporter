import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { MaterialModule } from 'src/app/material.module';

import { Vote } from 'src/app/models/vote';
import { Annotation } from 'src/app/models/annotation';

import { VotesService } from 'src/app/services/votes.service';
import { AnnotationsService } from 'src/app/services/annotations.service';
import { CitizenContextService } from 'src/app/services/citizen-context.service';

import { VoteMapComponent } from '../components/vote-map/vote-map.component';

interface VoteWithAnnotation {
  vote: Vote;
  annotation: Annotation | null;
}

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
    private votesService: VotesService,
    private annotationsService: AnnotationsService,
    private citizenContextService: CitizenContextService
  ) {}

  ngOnInit(): void {
    this.loadCurrentCitizenAndVotes();
  }

  private loadCurrentCitizenAndVotes(): void {
    this.loading = true;
    this.error = '';

    this.citizenContextService.getCurrentCitizenId().subscribe({
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
    this.votesService.getByCitizen(idCitizen).subscribe({
      next: (votes) => {
        const citizenVotes = votes.filter(vote => vote.id_citizen === idCitizen);

        if (!citizenVotes.length) {
          this.items = [];
          this.selectedItem = null;
          this.loading = false;
          return;
        }

        const requests = citizenVotes.map((vote) =>
          this.annotationsService.getById(vote.id_annotation).pipe(
            map((annotation) => ({
              vote,
              annotation
            })),
            catchError(() =>
              of({
                vote,
                annotation: null
              })
            )
          )
        );

        forkJoin(requests).subscribe({
          next: (items) => {
            this.items = items;
            this.selectedItem = items[0] ?? null;
            this.loading = false;
          },
          error: () => {
            this.items = [];
            this.loading = false;
          }
        });
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
