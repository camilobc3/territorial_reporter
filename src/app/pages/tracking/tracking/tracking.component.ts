import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import * as L from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';

import { MaterialModule } from 'src/app/material.module';
import { Official } from 'src/app/models/official';
import { Entity } from 'src/app/models/entity';
import { OfficerMarker } from 'src/app/models/officer-marker';

import { OfficialsService } from 'src/app/services/officials.service';
import { EntitiesService } from 'src/app/services/entity.service';
import { NotificationService } from 'src/app/services/notification.service';
import { LeafletMapService } from 'src/app/services/api/leaflet/leaflet-map.service';

interface OfficialTrackingUpdate {
  id_official: number;
  latitude: number;
  longitude: number;
  last_gps_update: string;
}

interface OfficialTrackingPayload {
  officials: OfficialTrackingUpdate[];
}

// Coordenadas aproximadas del centro de Manizales
const MANIZALES_CENTER = { centerLat: 5.0703, centerLng: -75.5138, zoom: 13 };

@Component({
  selector: 'app-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule, LeafletModule],
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.scss',
})
export class TrackingComponent implements OnInit, OnDestroy {

  entities: Entity[] = [];
  officials: Official[] = [];
  loading = false;

  selectedEntityId: number | null = null;
  searchText = '';
  lastUpdate: Date | null = null;

  mapOptions!: L.MapOptions;

  private map!: L.Map;
  private markersLayer = new L.FeatureGroup();
  private markerById = new Map<number, L.Marker>();
  private trackedIds: number[] = [];
  private trackingSub?: Subscription;

  constructor(
    private officialsService: OfficialsService,
    private entitiesService: EntitiesService,
    private notificationService: NotificationService,
    private mapService: LeafletMapService,
  ) {}

  // ── Ciclo de vida ────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.mapOptions = this.mapService.buildMapOptions(MANIZALES_CENTER);
    this.loadEntities();
    this.loadOfficials();
    this.subscribeToTracking();
  }

  ngOnDestroy(): void {
    this.trackingSub?.unsubscribe();
    this.stopTracking();
  }

  // ── Mapa ─────────────────────────────────────────────────────────────────

  onMapReady(map: L.Map): void {
    this.map = map;
    this.markersLayer.addTo(this.map);
    this.renderMarkers();
  }

  // ── Carga de datos ───────────────────────────────────────────────────────

  loadEntities(): void {
    this.entitiesService.getPaged(1, 100).subscribe({
      next: (resp) => this.entities = resp.data ?? [],
      error: () => this.entities = [],
    });
  }

  loadOfficials(): void {
    this.loading = true;
    this.stopTracking();

    const request$ = this.selectedEntityId
      ? this.officialsService.getByEntity(this.selectedEntityId)
      : this.officialsService.getPaged(1, 1000).pipe(map((resp) => resp.data ?? []));

    request$.subscribe({
      next: (officials) => {
        this.officials = officials ?? [];
        this.loading = false;
        this.lastUpdate = new Date();
        this.renderMarkers();
        this.startTracking();
      },
      error: () => {
        this.officials = [];
        this.loading = false;
      },
    });
  }

  onEntityChange(): void {
    this.loadOfficials();
  }

  refresh(): void {
    this.loadOfficials();
  }

  // ── Seguimiento en tiempo real (WebSocket) ──────────────────────────────

  private subscribeToTracking(): void {
    this.trackingSub = this.notificationService
      .onNewNotification('official_tracking')
      .subscribe((payload: OfficialTrackingPayload) => {
        this.applyTrackingUpdate(payload);
      });
  }

  private applyTrackingUpdate(payload: OfficialTrackingPayload): void {
    if (!payload?.officials?.length) return;

    payload.officials.forEach((update) => {
      const official = this.officials.find(o => o.id_official === update.id_official);
      if (official) {
        official.last_latitude = update.latitude;
        official.last_longitude = update.longitude;
        official.last_gps_update = update.last_gps_update;
      }

      const marker = this.markerById.get(update.id_official);
      if (marker) {
        marker.setLatLng([update.latitude, update.longitude]);
      }
    });

    this.lastUpdate = new Date();
  }

  private startTracking(): void {
    this.trackedIds = this.officials
      .filter(o => o.gps_active && o.last_latitude != null && o.last_longitude != null)
      .map(o => o.id_official)
      .filter((id): id is number => id != null);

    if (this.trackedIds.length) {
      this.officialsService.startTracking(this.trackedIds).subscribe({ error: () => {} });
    }
  }

  private stopTracking(): void {
    if (this.trackedIds.length) {
      this.officialsService.stopTracking(this.trackedIds).subscribe({ error: () => {} });
      this.trackedIds = [];
    }
  }

  // ── Marcadores ───────────────────────────────────────────────────────────

  private renderMarkers(): void {
    if (!this.map) return;

    this.markersLayer.clearLayers();
    this.markerById.clear();

    const located = this.officials.filter(
      o => o.last_latitude != null && o.last_longitude != null
    );

    located.forEach((official) => {
      const marker = this.mapService.buildOfficerMarker(this.toOfficerMarker(official));
      this.markersLayer.addLayer(marker);
      if (official.id_official != null) {
        this.markerById.set(official.id_official, marker);
      }
    });

    if (located.length > 0) {
      const bounds = this.markersLayer.getBounds();
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
      }
    } else {
      this.map.setView(
        [MANIZALES_CENTER.centerLat, MANIZALES_CENTER.centerLng],
        MANIZALES_CENTER.zoom
      );
    }
  }

  private toOfficerMarker(official: Official): OfficerMarker {
    return {
      id_user: official.id_official!,
      name: official.name,
      entity: this.entityName(official.id_entity),
      lat: official.last_latitude!,
      lng: official.last_longitude!,
      status: official.gps_active ? 'online' : 'offline',
      updated_at: official.last_gps_update ?? '',
    };
  }

  private entityName(idEntity: number): string {
    return this.entities.find(e => e.id_entity === idEntity)?.name ?? '';
  }

  // ── Listado / búsqueda ───────────────────────────────────────────────────

  get filteredOfficials(): Official[] {
    if (!this.searchText.trim()) return this.officials;
    const q = this.searchText.toLowerCase();
    return this.officials.filter(o =>
      o.name?.toLowerCase().includes(q) ||
      o.role?.toLowerCase().includes(q)
    );
  }

  get activeCount(): number {
    return this.officials.filter(o => o.gps_active).length;
  }

  get offlineCount(): number {
    return this.officials.filter(o => !o.gps_active).length;
  }

  get total(): number {
    return this.officials.length;
  }

  getInitials(name: string): string {
    return (name || '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  focusOfficial(official: Official): void {
    if (!this.map || official.last_latitude == null || official.last_longitude == null) return;

    this.map.setView([official.last_latitude, official.last_longitude], 16);

    const marker = official.id_official != null
      ? this.markerById.get(official.id_official)
      : undefined;
    marker?.openPopup();
  }
}