import { Injectable } from '@angular/core';
import { Observable, of, switchMap, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import * as L from 'leaflet';

import { PointsService } from 'src/app/services/points.service';
import { LeafletMapService } from 'src/app/services/api/leaflet/leaflet-map.service';
import { GeoJsonFeature, GeoJsonPolygon } from 'src/app/types/map.types';
import { Point } from 'src/app/models/point';

export interface PolygonData {
  polygon:     L.Polygon;
  geojson:     GeoJsonFeature<GeoJsonPolygon>;
  coordinates: [number, number][];
}

@Injectable({ providedIn: 'root' })
export class PolygonPersistenceService {

  constructor(
    private pointsService: PointsService,
    private mapService:    LeafletMapService,
  ) {}

  /**
   * Carga los puntos de un barrio desde el backend y los convierte
   * en un polígono Leaflet listo para renderizar.
   * Devuelve null si el barrio no tiene puntos.
   */
  load(idNeighborhood: number): Observable<PolygonData | null> {
    return this.pointsService.getByNeighborhood(idNeighborhood).pipe(
      map((points: Point[]) => {
        if (points.length === 0) return null;

        const sorted  = [...points].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const latlngs = sorted.map(p => [p.latitude, p.longitude] as [number, number]);
        const polygon = L.polygon(latlngs, { color: '#3b82f6', weight: 2 });
        const geojson = this.mapService.layerToGeoJson(polygon);
        const coordinates = (geojson.geometry.coordinates[0] ?? []) as [number, number][];

        return { polygon, geojson, coordinates };
      })
    );
  }

  /**
   * Elimina todos los puntos existentes del barrio y crea los nuevos.
   * Estrategia: delete uno por uno + create uno por uno con forkJoin.
   */
  save(idNeighborhood: number, coordinates: [number, number][]): Observable<any> {
    return this.pointsService.getByNeighborhood(idNeighborhood).pipe(
      switchMap((existingPoints) => {
        const deletes$ = existingPoints.length > 0
          ? forkJoin(existingPoints.map(p => this.pointsService.delete(p.id_point!)))
          : of([]);
        return deletes$;
      }),
      switchMap(() => {
        if (coordinates.length === 0) return of([]);

        const newPoints = coordinates.map((coord, index) => ({
          id_neighborhood: idNeighborhood,
          id_annotation:   null,
          latitude:        coord[1],  // GeoJSON es [lng, lat]
          longitude:       coord[0],
          order:           index,
          point_type:      'polygon',
        }));

        return forkJoin(newPoints.map(p => this.pointsService.create(p)));
      })
    );
  }
}