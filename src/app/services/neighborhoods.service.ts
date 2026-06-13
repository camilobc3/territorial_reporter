import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Neighborhood } from '../models/neighborhood';
import { GeoJsonFeature, GeoJsonPolygon } from '../types/map.types';
import { NeighborhoodPolygon } from '../models/neighborhood-polygon';

@Injectable({
  providedIn: 'root'
})
export class NeighborhoodsService {

  private readonly apiUrl = `${environment.apiUrl}/api/neighborhoods`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los barrios
   * GET /neighborhoods
   */
  getAll(): Observable<Neighborhood[]> {
    return this.http.get<Neighborhood[]>(this.apiUrl);
  }

  /**
   * Obtener barrios paginados
   * GET /neighborhoods?page=&pageSize=
   */
  getPaged(page: number, pageSize: number): Observable<{
    data: Neighborhood[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<{
      data: Neighborhood[];
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    }>(this.apiUrl, { params });
  }

  /**
   * Obtener barrio por ID
   * GET /neighborhoods/:id
   */
  getById(id: number): Observable<Neighborhood> {
    return this.http.get<Neighborhood>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener barrios por comuna
   * GET /neighborhoods?id_commune=
   */
  getByCommune(idCommune: number): Observable<Neighborhood[]> {
    const params = new HttpParams().set('id_commune', String(idCommune));
    return this.http.get<Neighborhood[]>(this.apiUrl, { params }).pipe(
      map(neighborhoods => neighborhoods.filter(n => n.id_commune === idCommune))
    );
  }

  /**
   * Crear barrio
   * POST /neighborhoods
   */
  create(neighborhood: Omit<Neighborhood, 'id_neighborhood'>): Observable<Neighborhood> {
    return this.http.post<Neighborhood>(this.apiUrl, neighborhood);
  }

  /**
   * Actualizar barrio completo
   * PUT /neighborhoods/:id
   */
  update(id: number, neighborhood: Neighborhood): Observable<Neighborhood> {
    return this.http.put<Neighborhood>(`${this.apiUrl}/${id}`, neighborhood);
  }

  /**
   * Eliminar barrio
   * DELETE /neighborhoods/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
 * Guardar polígono de un barrio
 * POST /neighborhoods/:id/polygon
 */
  savePolygon(id: number, geojson: GeoJsonFeature<GeoJsonPolygon>): Observable<NeighborhoodPolygon> {
    return this.http.post<NeighborhoodPolygon>(`${this.apiUrl}/${id}/polygon`, { geojson });
  }
}