import { GeoJsonFeature, GeoJsonPolygon, OfficerOnlineStatus } from '../types/map.types';
// ─────────────────────────────────────────────────────────────────────────────
// Marcador de funcionario
// Representa lo que el backend devuelve para CU-11 (ubicación en tiempo real)
// ─────────────────────────────────────────────────────────────────────────────
 
export interface OfficerMarker {
    id_user:    number;
    name:       string;
    entity:     string;
    lat:        number;
    lng:        number;
    status:     OfficerOnlineStatus;                      // 'online' | 'offline'
    updated_at: string;                                   // ISO timestamp
  }