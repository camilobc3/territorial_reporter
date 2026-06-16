import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Vote } from 'src/app/models/vote';
import { AnnotationsService } from 'src/app/services/annotations.service';
import { CitizenContextService } from 'src/app/services/citizen-context.service';
import { VotesService } from 'src/app/services/votes.service';
import { VoteFormValue } from '../types/vote-form.types';
import { VoteWithAnnotation } from '../types/vote-view.types';

@Injectable({ providedIn: 'root' })
export class VoteFacadeService {

  constructor(
    private votesService: VotesService,
    private annotationsService: AnnotationsService,
    private citizenContextService: CitizenContextService,
  ) {}

  getCurrentCitizenId(): Observable<number> {
    return this.citizenContextService.getCurrentCitizenId();
  }

  findExistingVote(idCitizen: number, idAnnotation: number): Observable<Vote | null> {
    return this.votesService.getByCitizenAndAnnotation(idCitizen, idAnnotation).pipe(
      map((votes) => this.toArray<Vote>(votes).find(
        vote => vote.id_citizen === idCitizen && vote.id_annotation === idAnnotation
      ) ?? null),
      catchError(() => of(null)),
    );
  }

  saveVote(
    existingVote: Vote | null,
    idCitizen: number,
    idAnnotation: number,
    value: VoteFormValue,
  ): Observable<Vote> {
    const voteData: Omit<Vote, 'id_vote'> = {
      id_citizen: idCitizen,
      id_annotation: idAnnotation,
      stars: value.stars,
      comment: value.comment,
    };

    return existingVote?.id_vote
      ? this.votesService.update(existingVote.id_vote, voteData)
      : this.votesService.create(voteData);
  }

  getCitizenVotesWithAnnotations(idCitizen: number): Observable<VoteWithAnnotation[]> {
    return this.votesService.getByCitizen(idCitizen).pipe(
      map((votes) => this.toArray<Vote>(votes).filter(vote => vote.id_citizen === idCitizen)),
      switchMap((votes) => {
        if (!votes.length) return of([]);

        return forkJoin(votes.map((vote) =>
          this.annotationsService.getById(vote.id_annotation).pipe(
            map((annotation) => ({ vote, annotation })),
            catchError(() => of({ vote, annotation: null })),
          )
        ));
      }),
    );
  }

  getVoteWithAnnotation(idVote: number): Observable<VoteWithAnnotation> {
    return this.votesService.getById(idVote).pipe(
      switchMap((vote) => this.annotationsService.getById(vote.id_annotation).pipe(
        map((annotation) => ({ vote, annotation })),
        catchError(() => of({ vote, annotation: null })),
      )),
    );
  }

  private toArray<T>(resp: unknown): T[] {
    if (Array.isArray(resp)) return resp as T[];

    const obj = resp as { data?: T[]; items?: T[] } | null | undefined;
    return obj?.data ?? obj?.items ?? [];
  }
}
