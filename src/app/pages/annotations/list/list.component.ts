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
import { ANNOTATION_STATUS_LEGEND, buildAnnotationIcon } from './annotation-marker.util';

const MANIZALES_CENTER = { centerLat: 5.0703, centerLng: -75.5138, zoom: 13 };

@Component({
  selector: 'app-annotations-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, LeafletModule, AnnotationDetailComponent],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  filterForm!: FormGroup;

  // ── Catálogos ────────────────────────────────────────────────────────────
  communes: Commune[] = [];
  neighborhoods: Neighborhood[] = [];
  categories: Category[] = [];
  entities: Entity[] = [];

  readonly statusLegend = ANNOTATION_STATUS_LEGEND;

  loadingCommunes = false;
  loadingNeighborhoods = false;
  loadingAnnotations = false;
  loadingDetail = false;

  // ── Selección actual ───────────────────────────────────────────────────
  selectedNeighborhood: Neighborhood | null = null;
  annotations: Annotation[] = [];

  selectedAnnotation: Annotation | null = null;
  selectedCategories: Category[] = [];
  selectedEntities: Entity[] = [];
  selectedEvidences: Evidence[] = [];
  selectedVotes: Vote[] = [];

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
      category: [null],
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
      error: () => { this.loadingCommunes = false; },
    });
  }

  private loadCatalogs(): void {
    forkJoin({
      categories: this.categoriesService.getAll(),
      entities: this.entitiesService.getPaged(1, 100),
    }).subscribe({
      next: ({ categories, entities }) => {
        this.categories = categories ?? [];
        this.entities = entities?.data ?? [];
      },
    });
  }

  // ── Filtros ────────────────────────────────────────────────────────────

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
      error: () => { this.loadingNeighborhoods = false; },
    });
  }

  onNeighborhoodChange(idNeighborhood: number): void {
    this.clearSelection();

    const neighborhood = this.neighborhoods.find((n) => n.id_neighborhood === idNeighborhood) ?? null;
    this.selectedNeighborhood = neighborhood;

    if (!neighborhood?.id_neighborhood) return;

    this.polygonPersistence.load(neighborhood.id_neighborhood).subscribe({
      next: (data) => {
        if (!data) return;

        this.drawnItems.addLayer(data.polygon);

        if (this.map) {
          const bounds = this.drawnItems.getBounds();
          if (bounds.isValid()) {
            this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 17 });
          }
        }
      },
      error: (err) => console.error('Error cargando polígono del barrio:', err),
    });

    this.loadAnnotations(neighborhood.id_neighborhood);
  }

  /** El filtro de categoría muestra solo las anotaciones asociadas a esa categoría. */
  onCategoryFilterChange(idCategory: number | null): void {
    if (!this.selectedNeighborhood) return;

    if (idCategory == null) {
      this.renderMarkers(this.annotations);
      return;
    }

    this.annotationCategoriesService.getByCategory(idCategory).subscribe({
      next: (resp) => {
        const relations = this.toArray<AnnotationCategory>(resp)
          .filter((r) => r.id_category === idCategory);
        const idsWithCategory = new Set(relations.map((r) => r.id_annotation));

        const filtered = this.annotations.filter(
          (a) => a.id_annotation != null && idsWithCategory.has(a.id_annotation)
        );
        this.renderMarkers(filtered);
      },
      error: () => this.renderMarkers(this.annotations),
    });
  }

  // ── Anotaciones ────────────────────────────────────────────────────────

  private loadAnnotations(idNeighborhood: number): void {
    this.loadingAnnotations = true;

    this.annotationsService.getByNeighborhood(idNeighborhood).subscribe({
      next: (resp) => {
        this.annotations = this.toArray<Annotation>(resp)
          .filter((a) => a.id_neighborhood === idNeighborhood);

        this.loadingAnnotations = false;

        const idCategory = this.filterForm.get('category')!.value as number | null;
        if (idCategory != null) {
          this.onCategoryFilterChange(idCategory);
        } else {
          this.renderMarkers(this.annotations);
        }
      },
      error: () => {
        this.annotations = [];
        this.loadingAnnotations = false;
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
          .filter((c) => c.id_annotation === idAnnotation);
        const categoryIds = new Set(categoryRelations.map((c) => c.id_category));
        this.selectedCategories = this.categories.filter(
          (c) => c.id_category != null && categoryIds.has(c.id_category)
        );

        const partyRelations = this.toArray<InterestedParty>(interestedParties)
          .filter((p) => p.id_annotation === idAnnotation);
        const entityIds = new Set(partyRelations.map((p) => p.id_entity));
        this.selectedEntities = this.entities.filter(
          (e) => e.id_entity != null && entityIds.has(e.id_entity)
        );

        this.selectedEvidences = this.toArray<Evidence>(evidences)
          .filter((e) => e.id_annotation === idAnnotation);

        this.selectedVotes = this.toArray<Vote>(votes)
          .filter((v) => v.id_annotation === idAnnotation);

        this.loadingDetail = false;
      },
      error: () => { this.loadingDetail = false; },
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
    this.selectedAnnotation = null;
    this.drawnItems.clearLayers();
    this.markersLayer.clearLayers();
  }

  // ── Utilidades ─────────────────────────────────────────────────────────

  /**
   * Algunos endpoints del backend devuelven un arreglo plano y otros una
   * respuesta paginada `{ data: [...] }` / `{ items: [...] }`. Esta utilidad
   * normaliza ambos casos a un arreglo, consistente con el patrón ya usado
   * en otros servicios del proyecto (p. ej. neighborhoods.service.ts).
   */
  private toArray<T>(resp: unknown): T[] {
    if (Array.isArray(resp)) return resp as T[];
    const obj = resp as { data?: T[]; items?: T[] } | null | undefined;
    return obj?.data ?? obj?.items ?? [];
  }
}