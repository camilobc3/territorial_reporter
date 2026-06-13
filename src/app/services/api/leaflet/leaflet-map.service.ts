import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import { MapConfig, DEFAULT_MAP_CONFIG, GeoJsonFeature, GeoJsonPolygon } from '../../../types/map.types';
import { NeighborhoodPolygon } from '../../../models/neighborhood-polygon';
import { OfficerMarker } from '../../../models/officer-marker';
import { buildOfficerIcon, buildOfficerPopup } from '../../../helpers/map.helper';
import { environment } from 'src/environments/environments';

@Injectable({ providedIn: 'root' })
export class LeafletMapService {

  // ── Opciones del mapa ────────────────────────────────────────────────────

  buildMapOptions(config: Partial<MapConfig> = {}): L.MapOptions {
    const cfg = {
      ...DEFAULT_MAP_CONFIG,
      tileUrl: environment.mapTileUrl,
      ...config,
    };
    return {
      layers: [this.buildTileLayer(cfg)],
      zoom:   cfg.zoom,
      center: L.latLng(cfg.centerLat, cfg.centerLng),
    };
  }

  buildDrawOptions(editableGroup: L.FeatureGroup): L.Control.DrawConstructorOptions {
    return {
      draw: {
        polygon: {
          shapeOptions: { color: '#3b82f6', fillOpacity: 0.2 },
          showArea: true,
        },
        polyline:     false,
        rectangle:    false,
        circle:       false,
        marker:       false,
        circlemarker: false,
      },
      edit: {
        featureGroup: editableGroup,
        remove: true,
      },
    };
  }

  // ── Conversión GeoJSON ────────────────────────────────────────────────────

  layerToGeoJson(layer: L.Polygon): GeoJsonFeature<GeoJsonPolygon> {
    return layer.toGeoJSON() as GeoJsonFeature<GeoJsonPolygon>;
  }

  loadPolygonOnMap(polygon: NeighborhoodPolygon, editableGroup: L.FeatureGroup): L.GeoJSON {
    const layer = L.geoJSON(polygon.geojson, {
      style: {
        color:       polygon.color ?? '#3b82f6',
        fillOpacity: 0.2,
        weight:      2,
      },
    });
    layer.addTo(editableGroup);
    return layer;
  }

  // ── Markers (CU-11) ───────────────────────────────────────────────────────

  buildOfficerMarker(officer: OfficerMarker): L.Marker {
    return L.marker([officer.lat, officer.lng], { icon: buildOfficerIcon(officer) })
      .bindPopup(buildOfficerPopup(officer));
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

  private buildTileLayer(cfg: MapConfig): L.TileLayer {
    return L.tileLayer(cfg.tileUrl, { attribution: cfg.attribution });
  }
}