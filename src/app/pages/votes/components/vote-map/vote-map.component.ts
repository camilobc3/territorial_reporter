import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import * as L from 'leaflet';

import { Annotation } from 'src/app/models/annotation';
import { LeafletMapService } from 'src/app/services/api/leaflet/leaflet-map.service';
import { PolygonPersistenceService } from 'src/app/services/api/leaflet/polygon-persistence.service';

const MANIZALES_CENTER = {
  centerLat: 5.0703,
  centerLng: -75.5138,
  zoom: 13
};

@Component({
  selector: 'app-vote-map',
  standalone: true,
  imports: [
    CommonModule,
    LeafletModule
  ],
  templateUrl: './vote-map.component.html',
  styleUrl: './vote-map.component.scss'
})
export class VoteMapComponent implements OnChanges {

  @Input() annotations: Annotation[] = [];
  @Input() idNeighborhood: number | null = null;
  @Input() selectedAnnotationId: number | null = null;
  @Input() height = '600px';

  @Output() annotationSelected = new EventEmitter<Annotation>();

  mapOptions!: L.MapOptions;

  private map!: L.Map;
  private polygonLayer = new L.FeatureGroup();
  private markersLayer = new L.FeatureGroup();
  private markerByAnnotationId = new Map<number, L.Marker>();

  constructor(
    private mapService: LeafletMapService,
    private polygonPersistence: PolygonPersistenceService
  ) {
    this.mapOptions = this.mapService.buildMapOptions(MANIZALES_CENTER);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idNeighborhood'] && this.map) {
      this.loadNeighborhoodPolygon();
    }

    if (changes['annotations'] && this.map) {
      this.renderMarkers();
    }

    if (changes['selectedAnnotationId'] && this.map) {
      this.focusSelectedAnnotation();
    }
  }

  onMapReady(map: L.Map): void {
    this.map = map;

    this.polygonLayer.addTo(this.map);
    this.markersLayer.addTo(this.map);

    this.loadNeighborhoodPolygon();
    this.renderMarkers();
    this.focusSelectedAnnotation();
  }

  private loadNeighborhoodPolygon(): void {
    if (!this.map) return;

    this.polygonLayer.clearLayers();

    if (!this.idNeighborhood) {
      this.map.setView(
        [MANIZALES_CENTER.centerLat, MANIZALES_CENTER.centerLng],
        MANIZALES_CENTER.zoom
      );
      return;
    }

    this.polygonPersistence.load(this.idNeighborhood).subscribe({
      next: (data) => {
        if (!data) return;

        this.polygonLayer.addLayer(data.polygon);

        const bounds = this.polygonLayer.getBounds();

        if (bounds.isValid()) {
          this.map.fitBounds(bounds, {
            padding: [40, 40],
            maxZoom: 17
          });
        }
      },
      error: (error) => {
        console.error('Error cargando polígono del barrio:', error);
      }
    });
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();
    this.markerByAnnotationId.clear();

    this.annotations.forEach((annotation) => {
      if (annotation.id_annotation == null) return;
      if (annotation.latitude == null || annotation.longitude == null) return;

      const marker = L.marker(
        [annotation.latitude, annotation.longitude],
        {
          icon: this.buildAnnotationIcon(annotation.status)
        }
      );

      marker.bindPopup(`
        <strong>Anotación #${annotation.id_annotation}</strong><br>
        ${annotation.description ?? ''}
      `);

      marker.on('click', () => {
        this.annotationSelected.emit(annotation);
      });

      this.markersLayer.addLayer(marker);
      this.markerByAnnotationId.set(annotation.id_annotation, marker);
    });

    this.focusSelectedAnnotation();
  }

  private focusSelectedAnnotation(): void {
    if (!this.map || !this.selectedAnnotationId) return;

    const annotation = this.annotations.find(
      item => item.id_annotation === this.selectedAnnotationId
    );

    if (!annotation) return;
    if (annotation.latitude == null || annotation.longitude == null) return;

    this.map.setView([annotation.latitude, annotation.longitude], 16);

    const marker = this.markerByAnnotationId.get(this.selectedAnnotationId);
    marker?.openPopup();
  }

  private buildAnnotationIcon(status: string | undefined | null): L.DivIcon {
    const color = this.getStatusColor(status);

    return L.divIcon({
      className: '',
      html: `<div style="
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.4);
      "></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }

  private getStatusColor(status: string | undefined | null): string {
    const key = (status ?? '').toLowerCase().trim();

    const colors: Record<string, string> = {
      open: '#2563eb',
      pending: '#2563eb',
      in_progress: '#f59e0b',
      in_review: '#f59e0b',
      resolved: '#16a34a',
      closed: '#16a34a',
      rejected: '#dc2626',
    };

    return colors[key] ?? '#6b7280';
  }
}