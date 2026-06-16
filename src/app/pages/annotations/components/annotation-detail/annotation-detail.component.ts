// annotation-detail.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { environment } from 'src/environments/environments';

import { Annotation } from 'src/app/models/annotation';
import { Category } from 'src/app/models/category';
import { Entity } from 'src/app/models/entity';
import { Evidence } from 'src/app/models/evidence';
import { Vote } from 'src/app/models/vote';

import { getCategoryIcon } from '../../category-icon.util';
import { getStatusBadgeClass, getStatusDotClass, getStatusLabel } from 'src/app/helpers/annotation-marker.helper';

@Component({
  selector: 'app-annotation-detail',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './annotation-detail.component.html',
})
export class AnnotationDetailComponent {

  @Input() annotation: Annotation | null = null;
  @Input() categories: Category[] = [];
  @Input() entities: Entity[] = [];
  @Input() evidences: Evidence[] = [];
  @Input() votes: Vote[] = [];
  @Input() loading = false;

  @Output() closed = new EventEmitter<void>();

  /** Para construir las URLs de las fotos de evidencia. */
  readonly imageBaseUrl = `${environment.apiUrl}/api/images/`;

  /** Para el iterador de estrellas en el template (@for (i of stars; ...)). */
  readonly stars = [1, 2, 3, 4, 5];

  iconFor(category: Category): string {
    return getCategoryIcon(category.name);
  }

  get statusLabel(): string {
    return getStatusLabel(this.annotation?.status);
  }

  get statusBadgeClass(): string {
    return getStatusBadgeClass(this.annotation?.status);
  }

  get statusDotClass(): string {
    return getStatusDotClass(this.annotation?.status);
  }

  get averageRating(): number | null {
    if (!this.votes.length) return null;
    const sum = this.votes.reduce((acc, v) => acc + (v.stars ?? 0), 0);
    return Math.round((sum / this.votes.length) * 10) / 10;
  }

  imageUrl(evidence: Evidence): string {
    return this.imageBaseUrl + (evidence.file_url ?? '');
  }

  onClose(): void {
    this.closed.emit();
  }
}
