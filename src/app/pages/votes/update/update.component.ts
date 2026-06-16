import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { MaterialModule } from 'src/app/material.module';

import { Vote } from 'src/app/models/vote';
import { Annotation } from 'src/app/models/annotation';

import { VoteFormComponent } from '../components/vote-form/vote-form.component';
import { VoteMapComponent } from '../components/vote-map/vote-map.component';
import { VoteFacadeService } from '../services/vote-facade.service';
import { VoteFormValue } from '../types/vote-form.types';

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
    private voteFacade: VoteFacadeService
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

    this.voteFacade.getVoteWithAnnotation(idVote).subscribe({
      next: ({ vote, annotation }) => {
        this.vote = vote;
        this.annotation = annotation;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar la votación.';
        this.loading = false;
      }
    });
  }

  updateVote(value: VoteFormValue): void {
    if (!this.vote?.id_vote) return;

    this.saving = true;
    this.error = '';
    this.message = '';

    this.voteFacade.saveVote(
      this.vote,
      this.vote.id_citizen,
      this.vote.id_annotation,
      value,
    ).subscribe({
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
