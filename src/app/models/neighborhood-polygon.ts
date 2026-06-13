import { GeoJsonFeature, GeoJsonPolygon } from '../types/map.types';
 
// ─────────────────────────────────────────────────────────────────────────────
// Polígono de barrio
// Representa lo que el backend devuelve / recibe para un barrio demarcado
// ─────────────────────────────────────────────────────────────────────────────
 
export interface NeighborhoodPolygon {
  id_neighborhood: number;
  name:            string;
  color?:          string;                              // hex, ej: '#3b82f6'
  geojson:         GeoJsonFeature<GeoJsonPolygon>;      // polígono estándar RFC 7946
  created_at?:     string;
  updated_at?:     string;
}