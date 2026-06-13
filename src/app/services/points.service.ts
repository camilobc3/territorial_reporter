import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environments';
import { Point } from '../models/point';

@Injectable({
  providedIn: 'root'
})
export class PointsService {

  private readonly apiUrl = `${environment.apiUrl}/api/points`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los puntos
   * GET /points
   */
  getAll(): Observable<Point[]> {
    return this.http.get<Point[]>(this.apiUrl);
  }

  /**
   * Obtener punto por ID
   * GET /points/:id
   */
  getById(id: number): Observable<Point> {
    return this.http.get<Point>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener puntos que forman el polígono de un barrio
   * GET /points?id_neighborhood=
   * Nota: id_neighborhood e id_annotation son mutuamente excluyentes
   */
  getByNeighborhood(idNeighborhood: number): Observable<Point[]> {
    const params = new HttpParams().set('id_neighborhood', String(idNeighborhood));
    return this.http.get<Point[]>(this.apiUrl, { params }).pipe(
      map(points => points.filter(p => p.id_neighborhood === idNeighborhood))
    );
  }

  /**
   * Obtener puntos asociados a una anotación
   * GET /points?id_annotation=
   * Nota: id_neighborhood e id_annotation son mutuamente excluyentes
   */
  getByAnnotation(idAnnotation: number): Observable<Point[]> {
    const params = new HttpParams().set('id_annotation', String(idAnnotation));
    return this.http.get<Point[]>(this.apiUrl, { params }).pipe(
      map(points => points.filter(p => p.id_annotation === idAnnotation))
    );
  }

  /**
   * Crear punto
   * POST /points
   */
  create(point: Omit<Point, 'id_point'>): Observable<Point> {
    return this.http.post<Point>(this.apiUrl, point);
  }

  /**
   * Crear múltiples puntos en lote (para guardar un polígono completo)
   * POST /points/bulk
   */
  createBulk(points: Omit<Point, 'id_point'>[]): Observable<Point[]> {
    return this.http.post<Point[]>(`${this.apiUrl}/bulk`, points);
  }

  /**
   * Actualizar punto completo
   * PUT /points/:id
   */
  update(id: number, point: Point): Observable<Point> {
    return this.http.put<Point>(`${this.apiUrl}/${id}`, point);
  }

  /**
   * Eliminar punto
   * DELETE /points/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Eliminar todos los puntos de un barrio (antes de redibujar el polígono)
   * DELETE /points?id_neighborhood=
   */
  deleteByNeighborhood(idNeighborhood: number): Observable<void> {
    const params = new HttpParams().set('id_neighborhood', String(idNeighborhood));
    return this.http.delete<void>(this.apiUrl, { params });
  }
}