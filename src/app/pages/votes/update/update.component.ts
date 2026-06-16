import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { forkJoin } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';

import { Vote } from 'src/app/models/vote';
import { Annotation } from 'src/app/models/annotation';

import { VotesService } from 'src/app/services/votes.service';
import { AnnotationsService } from 'src/app/services/annotations.service';

import {
  VoteFormComponent,
  VoteFormValue
} from '../components/vote-form/vote-form.component';
import { VoteMapComponent } from '../components/vote-map/vote-map.component';

@Component({
  selector: 'app-update-vote',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    VoteFormComponent,
    VoteMapComponent
  ],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss'
})
export class UpdateComponent implements OnInit {

  vote: Vote | null = null;
  annotation: Annotation | null = null;

  loading = false;
  saving = false;
  error = '';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private votesService: VotesService,
    private annotationsService: AnnotationsService
  ) {}

  ngOnInit(): void {
    this.loadVote();
  }

  private loadVote(): void {
    const idVote = Number(this.route.snapshot.paramMap.get('id'));

    if (!idVote) {
      this.error = 'No se encontró el identificador de la votación.';
      return;
    }

    this.loading = true;

    this.votesService.getById(idVote).subscribe({
      next: (vote) => {
        this.vote = vote;
        this.loadAnnotation(vote.id_annotation);
      },
      error: () => {
        this.error = 'No se pudo cargar la votación.';
        this.loading = false;
      }
    });
  }

  private loadAnnotation(idAnnotation: number): void {
    this.annotationsService.getById(idAnnotation).subscribe({
      next: (annotation) => {
        this.annotation = annotation;
        this.loading = false;
      },
      error: () => {
        this.annotation = null;
        this.loading = false;
      }
    });
  }

  updateVote(value: VoteFormValue): void {
    if (!this.vote?.id_vote) return;

    this.saving = true;
    this.error = '';
    this.message = '';

    const updatedVote: Vote = {
      ...this.vote,
      stars: value.stars,
      comment: value.comment
    };

    this.votesService.update(this.vote.id_vote, updatedVote).subscribe({
      next: (vote) => {
        this.vote = vote;
        this.message = 'Calificación actualizada correctamente.';
        this.saving = false;
      },
      error: (error) => {
        console.error(error);
        this.error = 'No se pudo actualizar la calificación.';
        this.saving = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/votes/list']);
  }
}