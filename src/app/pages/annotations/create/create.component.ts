// create.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';
import { Observable, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

import { MaterialModule } from 'src/app/material.module';

import { Commune } from 'src/app/models/commune';
import { Neighborhood } from 'src/app/models/neighborhood';
import { Category } from 'src/app/models/category';
import { Entity } from 'src/app/models/entity';
import { Annotation } from 'src/app/models/annotation';

import { CommunesService } from 'src/app/services/communes.service';
import { NeighborhoodsService } from 'src/app/services/neighborhoods.service';
import { CategoriesService } from 'src/app/services/categories.service';
import { EntitiesService } from 'src/app/services/entity.service';
import { AnnotationsService } from 'src/app/services/annotations.service';
import { AnnotationCategoriesService } from 'src/app/services/annotation-categories.service';
import { InterestedPartiesService } from 'src/app/services/interested-parties.service';
import { EvidencesService } from 'src/app/services/evidences.service';
import { CitizenContextService } from 'src/app/services/citizen-context.service';

import { LeafletMapService } from 'src/app/services/api/leaflet/leaflet-map.service';
import { PolygonPersistenceService } from 'src/app/services/api/leaflet/polygon-persistence.service';

import { AnnotationFormComponent } from '../components/annotation-form/annotation-form.component';
import { AnnotationFormPayload } from '../types/annotation-form.types';

// Coordenadas aproximadas del centro de Manizales (consistente con tracking.component.ts)
const MANIZALES_CENTER = { centerLat: 5.0703, centerLng: -75.5138, zoom: 13 };

@Component({
  selector: 'app-annotations-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, LeafletModule, AnnotationFormComponent],
  templateUrl: './create.component.html',
})
export class CreateComponent implements OnInit {

  @ViewChild(AnnotationFormComponent) annotationForm?: AnnotationFormComponent;

  filterForm!: FormGroup;

  // ── Catálogos ────────────────────────────────────────────────────────────
  communes: Commune[] = [];
  neighborhoods: Neighborhood[] = [];
  categories: Category[] = [];
  entities: Entity[] = [];

  loadingCommunes = false;
  loadingNeighborhoods = false;
  loadingCatalogs = false;
  loadingCitizen = false;
  saving = false;
  currentCitizenId: number | null = null;

  // ── Selección actual ───────────────────────────────────────────────────
  selectedNeighborhood: Neighborhood | null = null;
  selectedLatitude: number | null = null;
  selectedLongitude: number | null = null;

  // ── Mapa ───────────────────────────────────────────────────────────────
  mapOptions!: L.MapOptions;
  drawnItems = new L.FeatureGroup();
  private map!: L.Map;
  private marker: L.Marker | null = null;

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
    private mapService: LeafletMapService,
    private polygonPersistence: PolygonPersistenceService,
    private citizenContextService: CitizenContextService,
  ) {}

  ngOnInit(): void {
    this.mapOptions = this.mapService.buildMapOptions(MANIZALES_CENTER);

    this.filterForm = this.fb.group({
      commune: [null],
      neighborhood: [{ value: null, disabled: true }],
      category: [null],
    });

    this.loadCurrentCitizen();
    this.loadCommunes();
    this.loadCatalogs();
  }

  // ── Carga inicial ──────────────────────────────────────────────────────

  private loadCurrentCitizen(): void {
    this.loadingCitizen = true;

    this.citizenContextService.getCurrentCitizenId().subscribe({
      next: (idCitizen) => {
        this.currentCitizenId = idCitizen;
        this.loadingCitizen = false;
      },
      error: () => {
        this.currentCitizenId = null;
        this.loadingCitizen = false;
      },
    });
  }

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
    this.loadingCatalogs = true;

    forkJoin({
      categories: this.categoriesService.getAll(),
      entities: this.entitiesService.getPaged(1, 100),
    }).subscribe({
      next: ({ categories, entities }) => {
        this.categories = categories.filter((c) => (c.status ?? 'active') === 'active');
        this.entities = (entities.data ?? []).filter((e) => (e.status ?? 'active') === 'active');
        this.loadingCatalogs = false;
      },
      error: () => { this.loadingCatalogs = false; },
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
  }

  /** El filtro de categoría superior preselecciona esa categoría en el formulario. */
  onCategoryFilterChange(idCategory: number | null): void {
    if (idCategory != null) {
      this.annotationForm?.preselectCategory(idCategory);
    }
  }

  // ── Mapa ───────────────────────────────────────────────────────────────

  onMapReady(map: L.Map): void {
    this.map = map;
    this.drawnItems.addTo(this.map);
    this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));
  }

  private onMapClick(e: L.LeafletMouseEvent): void {
    if (!this.selectedNeighborhood) {
      Swal.fire({
        icon: 'info',
        title: 'Selecciona un barrio',
        text: 'Elige una comuna y un barrio antes de marcar un punto en el mapa.',
        timer: 2200,
        showConfirmButton: false,
      });
      return;
    }

    this.setSelectedPoint(e.latlng.lat, e.latlng.lng);
  }

  /** Sincroniza el marcador del mapa con un punto (clic en mapa o edición manual en el form). */
  private setSelectedPoint(lat: number, lng: number): void {
    this.selectedLatitude = lat;
    this.selectedLongitude = lng;

    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    } else {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
  }

  /** El formulario emite esto cuando el usuario edita manualmente lat/lng. */
  onLocationChange(location: { latitude: number; longitude: number }): void {
    this.setSelectedPoint(location.latitude, location.longitude);
    if (this.map) this.map.panTo([location.latitude, location.longitude]);
  }

  private clearSelection(): void {
    this.selectedNeighborhood = null;
    this.selectedLatitude = null;
    this.selectedLongitude = null;
    this.drawnItems.clearLayers();

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }
  }

  // ── Guardar anotación ──────────────────────────────────────────────────

  onFormSubmit(payload: AnnotationFormPayload): void {
    if (!this.selectedNeighborhood?.id_neighborhood) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona un barrio',
        text: 'Debes seleccionar una comuna y un barrio para asociar la anotación.',
      });
      return;
    }

    if (!this.currentCitizenId) {
      Swal.fire({
        icon: 'warning',
        title: 'Ciudadano no identificado',
        text: 'No se pudo asociar la anotación al usuario autenticado.',
      });
      return;
    }

    this.saving = true;

    const annotationData: Omit<Annotation, 'id_annotation'> = {
      id_neighborhood: this.selectedNeighborhood.id_neighborhood,
      id_citizen: this.currentCitizenId,
      description: payload.description,
      latitude: payload.latitude,
      longitude: payload.longitude,
      status: 'open',
    };

    this.annotationsService.create(annotationData).subscribe({
      next: (annotation) => this.saveRelations(annotation, payload),
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message ?? 'No se pudo crear la anotación.';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      },
    });
  }

  private saveRelations(annotation: Annotation, payload: AnnotationFormPayload): void {
    const idAnnotation = annotation.id_annotation!;
    const requests: Observable<unknown>[] = [];

    payload.categoryIds.forEach((id_category) => {
      requests.push(this.annotationCategoriesService.create({ id_category, id_annotation: idAnnotation }));
    });

    payload.entityIds.forEach((id_entity) => {
      requests.push(this.interestedPartiesService.create({ id_entity, id_annotation: idAnnotation }));
    });

    payload.photos.forEach((file) => {
      requests.push(this.evidencesService.upload(idAnnotation, file));
    });

    if (requests.length === 0) {
      this.onSaveSuccess();
      return;
    }

    forkJoin(requests).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => {
        this.saving = false;
        Swal.fire({
          icon: 'warning',
          title: 'Anotación creada con observaciones',
          text: 'La anotación se guardó, pero algunas categorías, entidades o fotografías no se pudieron asociar. Verifícala desde el listado de anotaciones.',
        });
        this.resetAfterSave();
      },
    });
  }

  private onSaveSuccess(): void {
    this.saving = false;
    Swal.fire({
      icon: 'success',
      title: 'Anotación creada',
      text: 'La anotación se registró correctamente.',
      timer: 2000,
      showConfirmButton: false,
    });
    this.resetAfterSave();
  }

  private resetAfterSave(): void {
    this.annotationForm?.reset();

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    this.selectedLatitude = null;
    this.selectedLongitude = null;
  }

  onCancel(): void {
    this.annotationForm?.reset();

    if (this.marker) {
      this.marker.remove();
      this.marker = null;
    }

    this.selectedLatitude = null;
    this.selectedLongitude = null;
  }
}
