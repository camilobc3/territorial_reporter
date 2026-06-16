// list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { forkJoin } from 'rxjs';

import { MaterialModule } from 'src/app/material.module';

import { Commune } from 'src/app/models/commune';
import { Neighborhood } from 'src/app/models/neighborhood';
import { Category } from 'src/app/models/category';
import { Entity } from 'src/app/models/entity';
import { Annotation } from 'src/app/models/annotation';
import { Evidence } from 'src/app/models/evidence';
import { Vote } from 'src/app/models/vote';
import { AnnotationCategory } from 'src/app/models/annotation-category';
import { InterestedParty } from 'src/app/models/interested-party';

import { CommunesService } from 'src/app/services/communes.service';
import { NeighborhoodsService } from 'src/app/services/neighborhoods.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { EntitiesService } from 'src/app/services/entity.service';
import { AnnotationsService } from 'src/app/services/annotations.service';
import { AnnotationCategoriesService } from 'src/app/services/annotation-categories.service';
import { InterestedPartiesService } from 'src/app/services/interested-parties.service';
import { EvidencesService } from 'src/app/services/evidences.service';
import { VotesService } from 'src/app/services/votes.service';

import { LeafletMapService } from 'src/app/services/api/leaflet/leaflet-map.service';
import { PolygonPersistenceService } from 'src/app/services/api/leaflet/polygon-persistence.service';

import { AnnotationDetailComponent } from '../components/annotation-detail/annotation-detail.component';
import { CategoryFilterPanelComponent } from '../components/category-filter-panel/category-filter-panel.component';
import { CategoryFilterNode } from '../types/category-filter.types';

import { ANNOTATION_STATUS_LEGEND, buildAnnotationIcon, getStatusDotClass } from 'src/app/helpers/annotation-marker.helper';

const MANIZALES_CENTER = {
  centerLat: 5.0703,
  centerLng: -75.5138,
  zoom: 13
};

@Component({
  selector: 'app-annotations-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    LeafletModule,
    AnnotationDetailComponent,
    CategoryFilterPanelComponent
  ],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  filterForm!: FormGroup;

  // ── Catálogos ────────────────────────────────────────────────────────────
  communes: Commune[] = [];
  neighborhoods: Neighborhood[] = [];
  categories: Category[] = [];
  entities: Entity[] = [];
  annotationCategoryRelations: AnnotationCategory[] = [];

  readonly statusLegend = ANNOTATION_STATUS_LEGEND;

  loadingCommunes = false;
  loadingNeighborhoods = false;
  loadingAnnotations = false;
  loadingDetail = false;

  // ── Selección actual ───────────────────────────────────────────────────
  selectedNeighborhood: Neighborhood | null = null;
  annotations: Annotation[] = [];
  visibleAnnotations: Annotation[] = [];

  selectedAnnotation: Annotation | null = null;
  selectedCategories: Category[] = [];
  selectedEntities: Entity[] = [];
  selectedEvidences: Evidence[] = [];
  selectedVotes: Vote[] = [];

  // ── Filtros jerárquicos ────────────────────────────────────────────────
  categoryNodes: CategoryFilterNode[] = [];
  selectedCategoryIds: number[] = [];

  // ── Mapa ───────────────────────────────────────────────────────────────
  mapOptions!: L.MapOptions;
  drawnItems = new L.FeatureGroup();
  markersLayer = new L.FeatureGroup();

  private map!: L.Map;

  constructor(
    private fb: FormBuilder,
    private communesService: CommunesService,
    private neighborhoodsService: NeighborhoodsService,
    private categoriesService: CategoriesService,
    private entitiesService: EntitiesService,
    private annotationsService: AnnotationsService,
    private annotationCategoriesService: AnnotationCategoriesService,
    private interestedPartiesService: InterestedPartiesService,
    private evidencesService: EvidencesService,
    private votesService: VotesService,
    private mapService: LeafletMapService,
    private polygonPersistence: PolygonPersistenceService,
  ) {}

  ngOnInit(): void {
    this.mapOptions = this.mapService.buildMapOptions(MANIZALES_CENTER);

    this.filterForm = this.fb.group({
      commune: [null],
      neighborhood: [{ value: null, disabled: true }],
    });

    this.loadCommunes();
    this.loadCatalogs();
  }

  // ── Carga inicial ──────────────────────────────────────────────────────

  private loadCommunes(): void {
    this.loadingCommunes = true;

    this.communesService.getAll().subscribe({
      next: (communes) => {
        this.communes = communes.sort((a, b) => a.name.localeCompare(b.name));
        this.loadingCommunes = false;
      },
      error: () => {
        this.loadingCommunes = false;
      },
    });
  }

  private loadCatalogs(): void {
    forkJoin({
      categories: this.categoriesService.getAll(),
      entities: this.entitiesService.getPaged(1, 100),
      annotationCategories: this.annotationCategoriesService.getAll(),
    }).subscribe({
      next: ({ categories, entities, annotationCategories }) => {
        this.categories = categories ?? [];
        this.entities = entities?.data ?? [];
        this.annotationCategoryRelations = this.toArray<AnnotationCategory>(annotationCategories);
        this.rebuildCategoryTree();
      },
      error: (error) => {
        console.error('Error cargando catálogos:', error);
      },
    });
  }

  // ── Filtros de territorio ──────────────────────────────────────────────

  onCommuneChange(idCommune: number): void {
    this.filterForm.get('neighborhood')!.reset();
    this.filterForm.get('neighborhood')!.disable();

    this.neighborhoods = [];
    this.clearSelection();

    if (!idCommune) return;

    this.loadingNeighborhoods = true;

    this.neighborhoodsService.getByCommune(idCommune).subscribe({
      next: (neighborhoods) => {
        this.neighborhoods = neighborhoods.sort((a, b) => a.name.localeCompare(b.name));
        this.filterForm.get('neighborhood')!.enable();
        this.loadingNeighborhoods = false;
      },
      error: () => {
        this.loadingNeighborhoods = false;
      },
    });
  }

  onNeighborhoodChange(idNeighborhood: number): void {
    this.clearSelection();

    const neighborhood = this.neighborhoods.find(
      item => item.id_neighborhood === idNeighborhood
    ) ?? null;

    this.selectedNeighborhood = neighborhood;

    if (!neighborhood?.id_neighborhood) return;

    this.loadNeighborhoodPolygon(neighborhood.id_neighborhood);
    this.loadAnnotations(neighborhood.id_neighborhood);
  }

  private loadNeighborhoodPolygon(idNeighborhood: number): void {
    this.polygonPersistence.load(idNeighborhood).subscribe({
      next: (data) => {
        if (!data) return;

        this.drawnItems.addLayer(data.polygon);

        if (this.map) {
          const bounds = this.drawnItems.getBounds();

          if (bounds.isValid()) {
            this.map.fitBounds(bounds, {
              padding: [40, 40],
              maxZoom: 17
            });
          }
        }
      },
      error: (error) => {
        console.error('Error cargando polígono del barrio:', error);
      },
    });
  }

  // ── Filtros de categoría y subcategoría ────────────────────────────────

  onCategorySelectionChange(ids: number[]): void {
    this.selectedCategoryIds = ids;
    this.applyCategoryFilters();
  }

  clearCategoryFilters(): void {
    this.selectedCategoryIds = [];
    this.applyCategoryFilters();
  }

  private applyCategoryFilters(): void {
    if (this.selectedCategoryIds.length === 0) {
      this.visibleAnnotations = [...this.annotations];
      this.renderMarkers(this.visibleAnnotations);
      return;
    }

    const acceptedCategoryIds = new Set<number>();

    this.selectedCategoryIds.forEach(id => {
      acceptedCategoryIds.add(id);

      this.getDescendantCategoryIds(id).forEach(descendantId => {
        acceptedCategoryIds.add(descendantId);
      });
    });

    const acceptedAnnotationIds = new Set<number>();

    this.annotationCategoryRelations.forEach(relation => {
      if (relation.id_annotation == null || relation.id_category == null) return;

      if (acceptedCategoryIds.has(relation.id_category)) {
        acceptedAnnotationIds.add(relation.id_annotation);
      }
    });

    this.visibleAnnotations = this.annotations.filter(annotation =>
      annotation.id_annotation != null &&
      acceptedAnnotationIds.has(annotation.id_annotation)
    );

    if (
      this.selectedAnnotation?.id_annotation != null &&
      !this.visibleAnnotations.some(item => item.id_annotation === this.selectedAnnotation?.id_annotation)
    ) {
      this.closeDetail();
    }

    this.renderMarkers(this.visibleAnnotations);
  }

  private rebuildCategoryTree(): void {
    const roots = this.categories
      .filter(category => category.id_parent_category == null)
      .sort((a, b) => a.name.localeCompare(b.name));

    this.categoryNodes = roots.map(root => this.buildCategoryNode(root));
  }

  private buildCategoryNode(category: Category): CategoryFilterNode {
    const children = this.categories
      .filter(item => item.id_parent_category === category.id_category)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(child => this.buildCategoryNode(child));

    return {
      category,
      children,
      count: this.countAnnotationsByCategoryAndDescendants(category)
    };
  }

  private countAnnotationsByCategoryAndDescendants(category: Category): number {
    if (category.id_category == null) return 0;

    const categoryIds = new Set<number>([
      category.id_category,
      ...this.getDescendantCategoryIds(category.id_category)
    ]);

    const currentAnnotationIds = new Set(
      this.annotations
        .map(annotation => annotation.id_annotation)
        .filter((id): id is number => id != null)
    );

    const matchedAnnotationIds = new Set<number>();

    this.annotationCategoryRelations.forEach(relation => {
      if (relation.id_annotation == null || relation.id_category == null) return;

      const belongsToCurrentNeighborhood = currentAnnotationIds.has(relation.id_annotation);
      const belongsToCategory = categoryIds.has(relation.id_category);

      if (belongsToCurrentNeighborhood && belongsToCategory) {
        matchedAnnotationIds.add(relation.id_annotation);
      }
    });

    return matchedAnnotationIds.size;
  }

  private getDescendantCategoryIds(idCategory: number): number[] {
    const children = this.categories.filter(
      category => category.id_parent_category === idCategory
    );

    const ids: number[] = [];

    children.forEach(child => {
      if (child.id_category == null) return;

      ids.push(child.id_category);
      ids.push(...this.getDescendantCategoryIds(child.id_category));
    });

    return ids;
  }

  // ── Anotaciones ────────────────────────────────────────────────────────

  private loadAnnotations(idNeighborhood: number): void {
    this.loadingAnnotations = true;

    this.annotationsService.getByNeighborhood(idNeighborhood).subscribe({
      next: (resp) => {
        this.annotations = this.toArray<Annotation>(resp)
          .filter(annotation => annotation.id_neighborhood === idNeighborhood);

        this.visibleAnnotations = [...this.annotations];

        this.loadingAnnotations = false;

        this.rebuildCategoryTree();
        this.applyCategoryFilters();
      },
      error: () => {
        this.annotations = [];
        this.visibleAnnotations = [];
        this.loadingAnnotations = false;

        this.rebuildCategoryTree();
        this.renderMarkers([]);
      },
    });
  }

  private renderMarkers(list: Annotation[]): void {
    this.markersLayer.clearLayers();

    list.forEach((annotation) => {
      if (annotation.id_annotation == null) return;
      if (annotation.latitude == null || annotation.longitude == null) return;

      const marker = L.marker([annotation.latitude, annotation.longitude], {
        icon: buildAnnotationIcon(annotation.status),
      });

      marker.on('click', () => this.selectAnnotation(annotation));
      this.markersLayer.addLayer(marker);
    });
  }

  statusLegendClass(status: string): string {
    return getStatusDotClass(status);
  }

  // ── Detalle de anotación ───────────────────────────────────────────────

  selectAnnotation(annotation: Annotation): void {
    this.selectedAnnotation = annotation;
    this.loadingDetail = true;

    this.selectedCategories = [];
    this.selectedEntities = [];
    this.selectedEvidences = [];
    this.selectedVotes = [];

    const idAnnotation = annotation.id_annotation!;

    if (this.map && annotation.latitude != null && annotation.longitude != null) {
      this.map.panTo([annotation.latitude, annotation.longitude]);
    }

    forkJoin({
      categories: this.annotationCategoriesService.getByAnnotation(idAnnotation),
      interestedParties: this.interestedPartiesService.getByAnnotation(idAnnotation),
      evidences: this.evidencesService.getByAnnotation(idAnnotation),
      votes: this.votesService.getByAnnotation(idAnnotation),
    }).subscribe({
      next: ({ categories, interestedParties, evidences, votes }) => {
        const categoryRelations = this.toArray<AnnotationCategory>(categories)
          .filter(item => item.id_annotation === idAnnotation);

        const categoryIds = new Set(categoryRelations.map(item => item.id_category));

        this.selectedCategories = this.categories.filter(
          category =>
            category.id_category != null &&
            categoryIds.has(category.id_category)
        );

        const partyRelations = this.toArray<InterestedParty>(interestedParties)
          .filter(item => item.id_annotation === idAnnotation);

        const entityIds = new Set(partyRelations.map(item => item.id_entity));

        this.selectedEntities = this.entities.filter(
          entity =>
            entity.id_entity != null &&
            entityIds.has(entity.id_entity)
        );

        this.selectedEvidences = this.toArray<Evidence>(evidences)
          .filter(evidence => evidence.id_annotation === idAnnotation);

        this.selectedVotes = this.toArray<Vote>(votes)
          .filter(vote => vote.id_annotation === idAnnotation);

        this.loadingDetail = false;
      },
      error: () => {
        this.loadingDetail = false;
      },
    });
  }

  closeDetail(): void {
    this.selectedAnnotation = null;
  }

  // ── Mapa ───────────────────────────────────────────────────────────────

  onMapReady(map: L.Map): void {
    this.map = map;
    this.drawnItems.addTo(this.map);
    this.markersLayer.addTo(this.map);
  }

  private clearSelection(): void {
    this.selectedNeighborhood = null;
    this.annotations = [];
    this.visibleAnnotations = [];
    this.selectedAnnotation = null;

    this.selectedCategoryIds = [];
    this.categoryNodes = [];

    this.drawnItems.clearLayers();
    this.markersLayer.clearLayers();
  }

  // ── Utilidades ─────────────────────────────────────────────────────────

  private toArray<T>(resp: unknown): T[] {
    if (Array.isArray(resp)) return resp as T[];

    const obj = resp as {
      data?: T[];
      items?: T[];
    } | null | undefined;

    return obj?.data ?? obj?.items ?? [];
  }
}
