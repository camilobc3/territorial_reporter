import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

import { MaterialModule } from 'src/app/material.module';
import { OptimizedTableComponent, OptimizedActionButton } from 'src/app/components/ui/optimized-table/optimized-table/optimized-table.component';
import { OptimizedColumnDef } from 'src/app/components/ui/optimized-table/optimized-table/optimized-column-def';

import { LeafletMapService } from 'src/app/services/api/leaflet/leaflet-map.service';
import { NeighborhoodsService } from 'src/app/services/neighborhoods.service';
import { Neighborhood } from 'src/app/models/neighborhood';
import { GeoJsonFeature, GeoJsonPolygon } from 'src/app/types/map.types';

import { Commune } from 'src/app/models/commune';
import { CommunesService } from 'src/app/services/communes.service';
import { PointsService } from 'src/app/services/points.service';

import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-neighborhood-map',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    LeafletModule,
    OptimizedTableComponent,
  ],
  templateUrl: './neighborhood-map.component.html',
})
export class NeighborhoodMapComponent implements OnInit {

  // ── Barrios ────────────────────────────────────────────────────────────────
  neighborhoods: Neighborhood[]  = [];
  selectedNeighborhood: Neighborhood | null = null;
  loading = false;
  communes: Commune[] = [];
  selectedCommuneId: number | null = null;
  loadingCommunes = false;

  // ── Mapa ───────────────────────────────────────────────────────────────────
  mapOptions!: L.MapOptions;
  drawOptions!: L.Control.DrawConstructorOptions;
  drawnItems  = new L.FeatureGroup();
  private map!: L.Map;

  // ── Estado del polígono ────────────────────────────────────────────────────
  currentGeoJson: GeoJsonFeature<GeoJsonPolygon> | null = null;
  coordinates:    [number, number][]                    = [];
  hasChanges      = false;
  saving          = false;

  // ── Estado del modo de dibujo ──────────────────────────────────────────────
  private drawHandler: any = null;
  drawMode: 'none' | 'drawing' | 'editing' = 'none';

  // ── Tabla de barrios ───────────────────────────────────────────────────────
  columns: OptimizedColumnDef[] = [
    { key: 'name',   header: 'Barrio' },
    {
      key: 'status', header: 'Estado', type: 'badge',
      badgeOptions: [
        { value: 'active',   label: 'Activo',   class: 'bg-light-success text-success' },
        { value: 'inactive', label: 'Inactivo', class: 'bg-light-error text-error'     },
      ],
    },
  ];

  actions: OptimizedActionButton[] = [
    { id: 'select', icon: 'map', tooltip: 'Demarcar', iconClass: 'text-primary' },
  ];

  constructor(
    private mapService: LeafletMapService,
    private neighborhoodsService: NeighborhoodsService,
    private communesService: CommunesService,
    private pointsService: PointsService,
  ) {}

  ngOnInit(): void {
    this.mapOptions = this.mapService.buildMapOptions();
    this.loadCommunes();
  }

  loadCommunes(): void {
    this.loadingCommunes = true;
    this.communesService.getAll().subscribe({
      next: (communes) => {
        this.communes = communes.sort((a, b) => a.name.localeCompare(b.name));
        this.loadingCommunes = false;
      },
      error: () => { this.loadingCommunes = false; }
    });
  }

  onCommuneChange(idCommune: number): void {
    if (!idCommune) return;
    this.selectedCommuneId = idCommune;
    this.loadNeighborhoods(idCommune);
  }

  // ── Carga de barrios ───────────────────────────────────────────────────────

  loadNeighborhoods(idCommune: number): void {
    this.loading = true;
    this.neighborhoodsService.getByCommune(idCommune).subscribe({
      next: (items: any) => {
        const list = Array.isArray(items) ? items : (items.items ?? items.data ?? []);
        this.neighborhoods = list;
        this.loading       = false;
      },
      error: () => {
        this.neighborhoods = [];
        this.loading       = false;
      },
    });
  }

  // ── Selección de barrio ────────────────────────────────────────────────────

  onAction(event: { actionId: string; row: Neighborhood }): void {
    if (event.actionId === 'select') this.selectNeighborhood(event.row);
  }

  selectNeighborhood(neighborhood: Neighborhood): void {
    if (this.hasChanges) {
      Swal.fire({
        title:             '¿Cambiar de barrio?',
        text:              'Tienes cambios sin guardar. Si continúas los perderás.',
        icon:              'warning',
        showCancelButton:  true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText:  'Cancelar',
      }).then(r => { if (r.isConfirmed) this.loadNeighborhood(neighborhood); });
      return;
    }
    this.loadNeighborhood(neighborhood);
  }

  private loadNeighborhood(neighborhood: Neighborhood): void {
    this.selectedNeighborhood = neighborhood;
    this.clearMap();
  
    this.pointsService.getByNeighborhood(neighborhood.id_neighborhood!).subscribe({
      next: (points) => {
        console.log('Puntos recibidos para barrio', neighborhood.id_neighborhood, ':', points);
  
        if (points.length === 0) {
          console.warn('No hay puntos para este barrio');
          return;
        }
  
        const sorted = [...points].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        console.log('Puntos ordenados:', sorted);
  
        const latlngs = sorted.map(p => [p.latitude, p.longitude] as [number, number]);
        console.log('latlngs para Leaflet:', latlngs);
  
        const polygon = L.polygon(latlngs, { color: '#3b82f6', weight: 2 });
        this.drawnItems.addLayer(polygon);
  
        this.currentGeoJson = this.mapService.layerToGeoJson(polygon);
        this.coordinates    = this.extractCoordinates(this.currentGeoJson);
        console.log('Polígono agregado al mapa');
      },
      error: (err) => console.error('Error cargando puntos:', err)
    });
  }

  // ── Eventos del mapa ───────────────────────────────────────────────────────

  onMapReady(map: L.Map): void {
    this.map = map;
    this.drawnItems.addTo(this.map);
  
    // Escuchar eventos sin agregar el control visual al mapa
    this.map.on((L as any).Draw.Event.CREATED,  (e: any) => this.onDrawCreated(e));
    this.map.on((L as any).Draw.Event.EDITED,   (e: any) => this.onDrawEdited(e));
    this.map.on((L as any).Draw.Event.DELETED,  ()       => this.onDrawDeleted());
  }

  startDrawing(): void {
    if (!this.map) return;
    this.drawHandler = new (L as any).Draw.Polygon(this.map, {
      shapeOptions: { color: '#3b82f6', weight: 2 }
    });
    this.drawHandler.enable();
    this.drawMode = 'drawing';
  }
  
  stopDrawing(): void {
    this.drawHandler?.disable();
    this.drawHandler = null;
    this.drawMode = 'none';
  }
  
  startEditing(): void {
    if (!this.map || this.drawnItems.getLayers().length === 0) return;
    new (L as any).EditToolbar.Edit(this.map, {
      featureGroup: this.drawnItems
    }).enable();
    this.drawMode = 'editing';
  }

  onDrawCreated(event: any): void {
    const e = event as L.DrawEvents.Created;
    if (!this.selectedNeighborhood) return;
  
    this.drawnItems.clearLayers();
    const layer = e.layer as L.Polygon;
    this.drawnItems.addLayer(layer);
  
    this.currentGeoJson = this.mapService.layerToGeoJson(layer);
    this.coordinates    = this.extractCoordinates(this.currentGeoJson);
    this.hasChanges     = true;
  }

  onDrawEdited(event: any): void {
    const e = event as L.DrawEvents.Edited;
    e.layers.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        this.currentGeoJson = this.mapService.layerToGeoJson(layer);
        this.coordinates    = this.extractCoordinates(this.currentGeoJson);
        this.hasChanges     = true;
      }
    });
  }

  onDrawDeleted(): void {
    this.clearPolygonState();
  }

  // ── Acciones del panel derecho ─────────────────────────────────────────────

  clearMap(): void {
    this.drawnItems.clearLayers();
    this.clearPolygonState();
    if (this.selectedNeighborhood) {
      this.hasChanges = true; // ← el usuario borró el polígono, hay que guardar
    }
  }

  confirmEditing(): void {
    // Guarda los cambios de la edición activa
    this.drawnItems.eachLayer((layer: any) => {
      if (layer instanceof L.Polygon) {
        this.currentGeoJson = this.mapService.layerToGeoJson(layer);
        this.coordinates    = this.extractCoordinates(this.currentGeoJson);
      }
    });
    this.hasChanges = true;
    this.drawMode   = 'none';
  }

  cancelChanges(): void {
    this.clearMap();
    this.selectedNeighborhood = null;
  }

  savePolygon(): void {
    if (!this.selectedNeighborhood || this.coordinates.length === 0) return;
  
    const idNeighborhood = this.selectedNeighborhood.id_neighborhood!;
    this.saving = true;
  
    // 1. Obtener puntos existentes del barrio
    this.pointsService.getByNeighborhood(idNeighborhood).pipe(
      switchMap((existingPoints) => {
        // 2. Eliminar todos los existentes en paralelo
        const deletes$ = existingPoints.length > 0
          ? forkJoin(existingPoints.map(p => this.pointsService.delete(p.id_point!)))
          : of([]);
  
        return deletes$;
      }),
      switchMap(() => {
        // 3. Crear los nuevos puntos en paralelo
        const newPoints = this.coordinates.map((coord, index) => ({
          id_neighborhood: idNeighborhood,
          id_annotation:   null,
          latitude:        coord[1],   // GeoJSON es [lng, lat]
          longitude:       coord[0],
          order:           index,
          point_type:      'polygon',
        }));
  
        return forkJoin(newPoints.map(p => this.pointsService.create(p)));
      })
    ).subscribe({
      next: () => {
        this.saving     = false;
        this.hasChanges = false;
        Swal.fire({
          icon:              'success',
          title:             'Polígono guardado',
          text:              `El barrio "${this.selectedNeighborhood!.name}" fue demarcado correctamente.`,
          timer:             2000,
          showConfirmButton: false,
        });
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message ?? 'No se pudo guardar el polígono.';
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private clearPolygonState(): void {
    this.currentGeoJson = null;
    this.coordinates    = [];
    this.hasChanges     = false;
  }

  private extractCoordinates(geojson: GeoJsonFeature<GeoJsonPolygon>): [number, number][] {
    return (geojson.geometry.coordinates[0] ?? []) as [number, number][];
  }
}