import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { MaterialModule } from 'src/app/material.module';
import { Vote } from 'src/app/models/vote';
import { VoteFormValue } from '../../types/vote-form.types';

@Component({
  selector: 'app-vote-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  templateUrl: './vote-form.component.html',
  styleUrl: './vote-form.component.scss'
})
export class VoteFormComponent implements OnChanges {

  @Input() vote: Vote | null = null;
  @Input() saving = false;

  @Output() voteSubmitted = new EventEmitter<VoteFormValue>();

  readonly stars = [1, 2, 3, 4, 5];

  form = this.fb.group({
    stars: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
    comment: ['', [Validators.maxLength(500)]]
  });

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vote']) {
      this.form.patchValue({
        stars: this.vote?.stars ?? 0,
        comment: this.vote?.comment ?? ''
      });
    }
  }

  setStars(stars: number): void {
    if (this.saving) return;

    this.form.patchValue({ stars });
    this.form.get('stars')?.markAsTouched();
  }

  submit(): void {
    if (this.form.invalid || this.saving) {
      this.form.markAllAsTouched();
      return;
    }

    const comment = this.form.value.comment?.trim();

    this.voteSubmitted.emit({
      stars: Number(this.form.value.stars),
      comment: comment ? comment : null
    });
  }
}
