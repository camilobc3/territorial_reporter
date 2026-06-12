import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { environment } from '../../environments/environments';
import { Commune } from '../models/commune';

@Injectable({
  providedIn: 'root'
})
export class CommunesService {

  private readonly apiUrl = `${environment.apiUrl}/api/communes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las comunas
   * GET /communes
   */
  getAll(): Observable<Commune[]> {
    return this.http.get<Commune[]>(this.apiUrl);
  }

  /**
   * Obtener comunas paginadas
   * GET /communes?page=&pageSize=
   */
  getPaged(page: number, pageSize: number): Observable<{
    data: Commune[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<{
      data: Commune[];
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    }>(this.apiUrl, { params });
  }

  /**
   * Obtener comuna por ID
   * GET /communes/:id
   */
  getById(id: number): Observable<Commune> {
    return this.http.get<Commune>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener comunas por ciudad
   * GET /communes?id_city=
   *
   * ⚠️ El backend actualmente ignora el query param `id_city` y
   * devuelve todas las comunas. Se filtra en el frontend como
   * solución temporal hasta que se corrija el endpoint.
   */
  getByCity(idCity: number): Observable<Commune[]> {
    const params = new HttpParams().set('id_city', String(idCity));
    return this.http.get<Commune[]>(this.apiUrl, { params }).pipe(
      map(communes => communes.filter(c => c.id_city === idCity))
    );
  }

  /**
   * Crear comuna
   * POST /communes
   */
  create(commune: Omit<Commune, 'id_commune'>): Observable<Commune> {
    return this.http.post<Commune>(this.apiUrl, commune);
  }

  /**
   * Actualizar comuna completa
   * PUT /communes/:id
   */
  update(id: number, commune: Commune): Observable<Commune> {
    return this.http.put<Commune>(`${this.apiUrl}/${id}`, commune);
  }

  /**
   * Eliminar comuna
   * DELETE /communes/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}