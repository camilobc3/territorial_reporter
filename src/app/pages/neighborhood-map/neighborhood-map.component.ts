import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

import { MaterialModule } from 'src/app/material.module';
import { Neighborhood } from 'src/app/models/neighborhood';
import { LeafletMapService } from 'src/app/services/api/leaflet/leaflet-map.service';
import { PolygonStateService } from '../../services/api/leaflet/polygon-state.service';
import { PolygonPersistenceService } from '../../services/api/leaflet/polygon-persistence.service';
import { NeighborhoodSelectorComponent } from './components/neighborhood-selector/neighborhood-selector.component';
import { MapToolsPanelComponent } from './components/map-tools-panel/map-tools-panel.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-neighborhood-map',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    LeafletModule,
    NeighborhoodSelectorComponent,
    MapToolsPanelComponent,
  ],
  templateUrl: './neighborhood-map.component.html',
})
export class NeighborhoodMapComponent implements OnInit {

  selectedNeighborhood: Neighborhood | null = null;
  saving = false;

  mapOptions!: L.MapOptions;
  drawnItems  = new L.FeatureGroup();
  private map!: L.Map;
  private drawHandler: any = null;

  constructor(
    private mapService:   LeafletMapService,
    public polygonState: PolygonStateService,
    private polygonPersistence: PolygonPersistenceService,
  ) {}

  ngOnInit(): void {
    this.mapOptions = this.mapService.buildMapOptions();
  }

  // ── Selección de barrio ────────────────────────────────────────────────────

  onNeighborhoodSelected(neighborhood: Neighborhood): void {
    this.selectedNeighborhood = neighborhood;
    this.drawnItems.clearLayers();
    this.polygonState.reset();

    this.polygonPersistence.load(neighborhood.id_neighborhood!).subscribe({
      next: (data) => {
        if (!data) return;
        this.drawnItems.addLayer(data.polygon);
        this.polygonState.setPolygon(data.geojson, data.coordinates);
        this.polygonState.markSaved();
      },
      error: (err) => console.error('Error cargando polígono:', err)
    });
  }

  // ── Mapa ───────────────────────────────────────────────────────────────────

  onMapReady(map: L.Map): void {
    this.map = map;
    this.drawnItems.addTo(this.map);
    this.map.on((L as any).Draw.Event.CREATED, (e: any) => this.onDrawCreated(e));
    this.map.on((L as any).Draw.Event.EDITED,  (e: any) => this.onDrawEdited(e));
    this.map.on((L as any).Draw.Event.DELETED, ()       => this.polygonState.reset());
  }

  onDrawCreated(event: any): void {
    if (!this.selectedNeighborhood) return;
    this.drawnItems.clearLayers();
    const layer   = event.layer as L.Polygon;
    this.drawnItems.addLayer(layer);
    const geojson = this.mapService.layerToGeoJson(layer);
    const coords  = (geojson.geometry.coordinates[0] ?? []) as [number, number][];
    this.polygonState.setPolygon(geojson, coords);
    this.polygonState.setDrawMode('none');
  }

  onDrawEdited(event: any): void {
    event.layers.eachLayer((layer: any) => {
      if (!(layer instanceof L.Polygon)) return;
      const geojson = this.mapService.layerToGeoJson(layer);
      const coords  = (geojson.geometry.coordinates[0] ?? []) as [number, number][];
      this.polygonState.setPolygon(geojson, coords);
    });
  }

  // ── Herramientas ───────────────────────────────────────────────────────────

  onStartDraw(): void {
    if (!this.map) return;
    this.drawHandler = new (L as any).Draw.Polygon(this.map, {
      shapeOptions: { color: '#3b82f6', weight: 2 }
    });
    this.drawHandler.enable();
    this.polygonState.setDrawMode('drawing');
  }

  onStopDraw(): void {
    this.drawHandler?.disable();
    this.drawHandler = null;
    this.polygonState.setDrawMode('none');
  }

  onStartEdit(): void {
    if (!this.map || this.drawnItems.getLayers().length === 0) return;
    new (L as any).EditToolbar.Edit(this.map, {
      featureGroup: this.drawnItems
    }).enable();
    this.polygonState.setDrawMode('editing');
  }

  onConfirmEdit(): void {
    this.drawnItems.eachLayer((layer: any) => {
      if (!(layer instanceof L.Polygon)) return;
      const geojson = this.mapService.layerToGeoJson(layer);
      const coords  = (geojson.geometry.coordinates[0] ?? []) as [number, number][];
      this.polygonState.setPolygon(geojson, coords);
    });
    this.polygonState.setDrawMode('none');
  }

  onClear(): void {
    this.drawnItems.clearLayers();
    this.polygonState.reset();
    if (this.selectedNeighborhood) this.polygonState.markChanged();
  }

  onCancel(): void {
    this.drawnItems.clearLayers();
    this.polygonState.reset();
    this.selectedNeighborhood = null;
  }

  // ── Guardar ────────────────────────────────────────────────────────────────

  onSave(): void {
    if (!this.selectedNeighborhood) return;
    this.saving = true;

    this.polygonPersistence
      .save(this.selectedNeighborhood.id_neighborhood!, this.polygonState.coordinates)
      .subscribe({
        next: () => {
          this.saving = false;
          this.polygonState.markSaved();
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
}
