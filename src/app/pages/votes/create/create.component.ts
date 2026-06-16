import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';

import { MaterialModule } from 'src/app/material.module';

import { Commune } from 'src/app/models/commune';
import { Neighborhood } from 'src/app/models/neighborhood';
import { Category } from 'src/app/models/category';
import { Annotation } from 'src/app/models/annotation';
import { AnnotationCategory } from 'src/app/models/annotation-category';
import { Vote } from 'src/app/models/vote';

import { CommunesService } from 'src/app/services/communes.service';
import { NeighborhoodsService } from 'src/app/services/neighborhoods.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { AnnotationsService } from 'src/app/services/annotations.service';
import { AnnotationCategoriesService } from 'src/app/services/annotation-categories.service';
import { VoteFacadeService } from '../services/vote-facade.service';

import { VoteFormComponent } from '../components/vote-form/vote-form.component';
import { VoteMapComponent } from '../components/vote-map/vote-map.component';
import { VoteFormValue } from '../types/vote-form.types';

@Component({
  selector: 'app-create-vote',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    VoteFormComponent,
    VoteMapComponent
  ],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss'
})
export class CreateComponent implements OnInit {

  filterForm!: FormGroup;

  communes: Commune[] = [];
  neighborhoods: Neighborhood[] = [];
  categories: Category[] = [];

  annotations: Annotation[] = [];
  filteredAnnotations: Annotation[] = [];

  selectedNeighborhood: Neighborhood | null = null;
  selectedAnnotation: Annotation | null = null;
  existingVote: Vote | null = null;

  currentCitizenId: number | null = null;

  loadingCitizen = false;
  loadingCommunes = false;
  loadingNeighborhoods = false;
  loadingAnnotations = false;
  loadingVote = false;
  savingVote = false;

  message = '';
  error = '';

  constructor(
    private fb: FormBuilder,
    private communesService: CommunesService,
    private neighborhoodsService: NeighborhoodsService,
    private categoriesService: CategoriesService,
    private annotationsService: AnnotationsService,
    private annotationCategoriesService: AnnotationCategoriesService,
    private voteFacade: VoteFacadeService
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      commune: [null],
      neighborhood: [{ value: null, disabled: true }],
      category: [null]
    });

    this.loadCurrentCitizen();
    this.loadCommunes();
    this.loadCategories();
  }

  private loadCurrentCitizen(): void {
    this.loadingCitizen = true;

    this.voteFacade.getCurrentCitizenId().subscribe({
      next: (idCitizen) => {
        this.currentCitizenId = idCitizen;
        this.loadingCitizen = false;
      },
      error: (error) => {
        console.error(error);
        this.error = 'No se pudo identificar el ciudadano autenticado.';
        this.loadingCitizen = false;
      }
    });
  }

  private loadCommunes(): void {
    this.loadingCommunes = true;

    this.communesService.getAll().subscribe({
      next: (communes) => {
        this.communes = communes.sort((a, b) => a.name.localeCompare(b.name));
        this.loadingCommunes = false;
      },
      error: () => {
        this.communes = [];
        this.loadingCommunes = false;
      }
    });
  }

  private loadCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (categories) => {
        this.categories = categories ?? [];
      },
      error: () => {
        this.categories = [];
      }
    });
  }

  onCommuneChange(idCommune: number): void {
    this.filterForm.get('neighborhood')?.reset();
    this.filterForm.get('neighborhood')?.disable();

    this.neighborhoods = [];
    this.clearSelectionAndAnnotations();

    if (!idCommune) return;

    this.loadingNeighborhoods = true;

    this.neighborhoodsService.getByCommune(idCommune).subscribe({
      next: (neighborhoods) => {
        this.neighborhoods = neighborhoods.sort((a, b) => a.name.localeCompare(b.name));
        this.filterForm.get('neighborhood')?.enable();
        this.loadingNeighborhoods = false;
      },
      error: () => {
        this.neighborhoods = [];
        this.loadingNeighborhoods = false;
      }
    });
  }

  onNeighborhoodChange(idNeighborhood: number): void {
    this.clearSelectionAndAnnotations();

    const neighborhood = this.neighborhoods.find(
      item => item.id_neighborhood === idNeighborhood
    ) ?? null;

    this.selectedNeighborhood = neighborhood;

    if (!neighborhood?.id_neighborhood) return;

    this.loadAnnotations(neighborhood.id_neighborhood);
  }

  onCategoryFilterChange(idCategory: number | null): void {
    this.selectedAnnotation = null;
    this.existingVote = null;
    this.message = '';
    this.error = '';

    if (idCategory == null) {
      this.filteredAnnotations = [...this.annotations];
      return;
    }

    this.annotationCategoriesService.getByCategory(idCategory).subscribe({
      next: (resp) => {
        const relations = this.toArray<AnnotationCategory>(resp)
          .filter(item => item.id_category === idCategory);

        const ids = new Set(relations.map(item => item.id_annotation));

        this.filteredAnnotations = this.annotations.filter(
          annotation =>
            annotation.id_annotation != null &&
            ids.has(annotation.id_annotation)
        );
      },
      error: () => {
        this.filteredAnnotations = [...this.annotations];
      }
    });
  }

  private loadAnnotations(idNeighborhood: number): void {
    this.loadingAnnotations = true;

    this.annotationsService.getByNeighborhood(idNeighborhood).subscribe({
      next: (resp) => {
        this.annotations = this.toArray<Annotation>(resp)
          .filter(item => item.id_neighborhood === idNeighborhood);

        this.loadingAnnotations = false;

        const idCategory = this.filterForm.get('category')?.value as number | null;

        if (idCategory != null) {
          this.onCategoryFilterChange(idCategory);
        } else {
          this.filteredAnnotations = [...this.annotations];
        }
      },
      error: () => {
        this.annotations = [];
        this.filteredAnnotations = [];
        this.loadingAnnotations = false;
      }
    });
  }

  selectAnnotation(annotation: Annotation): void {
    this.selectedAnnotation = annotation;
    this.existingVote = null;
    this.message = '';
    this.error = '';

    this.loadExistingVote(annotation);
  }

  private loadExistingVote(annotation: Annotation): void {
    if (!this.currentCitizenId || !annotation.id_annotation) return;

    this.loadingVote = true;

    this.voteFacade.findExistingVote(this.currentCitizenId, annotation.id_annotation).subscribe({
      next: (vote) => {
        this.existingVote = vote;
        this.loadingVote = false;
      },
      error: () => {
        this.existingVote = null;
        this.loadingVote = false;
      }
    });
  }

  saveVote(value: VoteFormValue): void {
    if (!this.currentCitizenId) {
      this.error = 'No se pudo identificar el ciudadano autenticado.';
      return;
    }

    if (!this.selectedAnnotation?.id_annotation) {
      this.error = 'Debes seleccionar una anotación.';
      return;
    }

    this.savingVote = true;
    this.message = '';
    this.error = '';

    this.voteFacade.saveVote(
      this.existingVote,
      this.currentCitizenId,
      this.selectedAnnotation.id_annotation,
      value,
    ).subscribe({
      next: (vote) => {
        this.existingVote = vote;
        this.message = 'Calificación guardada correctamente.';
        this.savingVote = false;
      },
      error: (error) => {
        console.error(error);
        this.error = 'No se pudo guardar la calificación.';
        this.savingVote = false;
      }
    });
  }

  private clearSelectionAndAnnotations(): void {
    this.selectedNeighborhood = null;
    this.selectedAnnotation = null;
    this.existingVote = null;
    this.annotations = [];
    this.filteredAnnotations = [];
    this.message = '';
    this.error = '';
  }

  private toArray<T>(resp: unknown): T[] {
    if (Array.isArray(resp)) return resp as T[];

    const obj = resp as {
      data?: T[];
      items?: T[];
    } | null | undefined;

    return obj?.data ?? obj?.items ?? [];
  }
}
