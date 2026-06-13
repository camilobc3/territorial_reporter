// ─────────────────────────────────────────────────────────────────────────────
// GeoJSON estándar (RFC 7946)
// ─────────────────────────────────────────────────────────────────────────────

export type GeoJsonCoordinate = [number, number];       // [lng, lat]
export type GeoJsonRing       = GeoJsonCoordinate[];    // anillo de un polígono

export type GeoJsonGeometryType = 'Point' | 'Polygon' | 'MultiPolygon';

export interface GeoJsonPoint {
  type: 'Point';
  coordinates: GeoJsonCoordinate;
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: GeoJsonRing[];                           // [exteriorRing, ...holeRings]
}

export interface GeoJsonMultiPolygon {
  type: 'MultiPolygon';
  coordinates: GeoJsonRing[][];
}

export type GeoJsonGeometry = GeoJsonPoint | GeoJsonPolygon | GeoJsonMultiPolygon;

export interface GeoJsonFeature<G extends GeoJsonGeometry = GeoJsonGeometry> {
  type: 'Feature';
  geometry: G;
  properties?: Record<string, any>;
}

export interface GeoJsonFeatureCollection<G extends GeoJsonGeometry = GeoJsonGeometry> {
  type: 'FeatureCollection';
  features: GeoJsonFeature<G>[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuración del mapa
// ─────────────────────────────────────────────────────────────────────────────

export interface MapConfig {
  centerLat:   number;
  centerLng:   number;
  zoom:        number;
  tileUrl:     string;
  attribution: string;
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  centerLat:   4.5709,
  centerLng:  -74.2973,
  zoom:        6,
  tileUrl:    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; <a href="...">OpenStreetMap</a> contributors',
};

// ─────────────────────────────────────────────────────────────────────────────
// Estado del funcionario en mapa (CU-11)
// ─────────────────────────────────────────────────────────────────────────────

export type OfficerOnlineStatus = 'online' | 'offline';