import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Annotation } from '../models/annotation';

@Injectable({
  providedIn: 'root'
})
export class AnnotationsService {

  private readonly apiUrl = `${environment.apiUrl}/api/annotations`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las anotaciones
   * GET /annotations
   */
  getAll(): Observable<Annotation[]> {
    return this.http.get<Annotation[]>(this.apiUrl);
  }

  /**
   * Obtener anotaciones paginadas
   * GET /annotations?page=&pageSize=
   */
  getPaged(page: number, pageSize: number): Observable<{
    data: Annotation[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<{
      data: Annotation[];
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    }>(this.apiUrl, { params });
  }

  /**
   * Obtener anotación por ID
   * GET /annotations/:id
   */
  getById(id: number): Observable<Annotation> {
    return this.http.get<Annotation>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener anotaciones por barrio
   * GET /annotations?id_neighborhood=
   */
  getByNeighborhood(idNeighborhood: number): Observable<Annotation[]> {
    const params = new HttpParams().set('id_neighborhood', String(idNeighborhood));
    return this.http.get<Annotation[]>(this.apiUrl, { params });
  }

  /**
   * Obtener anotaciones por ciudadano
   * GET /annotations?id_citizen=
   */
  getByCitizen(idCitizen: number): Observable<Annotation[]> {
    const params = new HttpParams().set('id_citizen', String(idCitizen));
    return this.http.get<Annotation[]>(this.apiUrl, { params });
  }

  /**
   * Crear anotación
   * POST /annotations
   */
  create(annotation: Omit<Annotation, 'id_annotation'>): Observable<Annotation> {
    return this.http.post<Annotation>(this.apiUrl, annotation);
  }

  /**
   * Actualizar anotación completa
   * PUT /annotations/:id
   */
  update(id: number, annotation: Annotation): Observable<Annotation> {
    return this.http.put<Annotation>(`${this.apiUrl}/${id}`, annotation);
  }

  /**
   * Eliminar anotación
   * DELETE /annotations/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}