import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environments';
import { Official } from '../models/official';

type PagedResponse = {
  data: Official[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

@Injectable({
  providedIn: 'root'
})
export class OfficialsService {

  private readonly apiUrl = `${environment.apiUrl}/api/officials`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los funcionarios
   * GET /officials
   */
  getAll(): Observable<Official[]> {
    return this.http.get<Official[]>(this.apiUrl);
  }

  /**
   * Obtener funcionarios paginados
   * GET /officials?page=&pageSize=
   */
  getPaged(page: number, pageSize: number): Observable<PagedResponse> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((resp) => {
        if (Array.isArray(resp)) {
          return {
            data: resp as Official[],
            page: 1,
            pageSize: resp.length,
            totalItems: resp.length,
            totalPages: 1,
          };
        }

        if (resp?.items) {
          return {
            data: resp.items as Official[],
            page: resp.page ?? 1,
            pageSize: resp.pageSize ?? pageSize,
            totalItems: resp.totalItems ?? resp.items.length,
            totalPages: resp.totalPages ?? 1,
          };
        }

        if (resp?.data) {
          return {
            data: resp.data as Official[],
            page: resp.page ?? 1,
            pageSize: resp.pageSize ?? pageSize,
            totalItems: resp.totalItems ?? resp.data.length,
            totalPages: resp.totalPages ?? 1,
          };
        }

        return {
          data: [],
          page: 1,
          pageSize,
          totalItems: 0,
          totalPages: 1,
        };
      })
    );
  }

  /**
   * Obtener funcionario por ID
   * GET /officials/:id
   */
  getById(id: number): Observable<Official> {
    return this.http.get<Official>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener funcionarios por entidad
   * GET /officials?id_entity=
   */
  getByEntity(idEntity: number): Observable<Official[]> {
    const params = new HttpParams().set('id_entity', String(idEntity));
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((resp) => {
        let officials: Official[] = [];

        if (Array.isArray(resp)) {
          officials = resp as Official[];
        } else if (resp?.items) {
          officials = resp.items as Official[];
        } else if (resp?.data) {
          officials = resp.data as Official[];
        }

        return officials.filter((official) => Number(official.id_entity) === idEntity);
      })
    );
  }

  /**
   * Obtener funcionarios con GPS activo
   * GET /officials?gps_active=true
   */
  getActiveGps(): Observable<Official[]> {
    const params = new HttpParams().set('gps_active', 'true');
    return this.http.get<Official[]>(this.apiUrl, { params });
  }

  /**
   * Crear funcionario
   * POST /officials
   */
  create(official: Omit<Official, 'id_official'>): Observable<Official> {
    return this.http.post<Official>(this.apiUrl, official);
  }

  /**
   * Actualizar funcionario completo
   * PUT /officials/:id
   */
  update(id: number, official: Official): Observable<Official> {
    return this.http.put<Official>(`${this.apiUrl}/${id}`, official);
  }

  /**
   * Actualizar ubicación GPS del funcionario
   * PATCH /officials/:id/location
   */
  updateLocation(id: number, latitude: number, longitude: number): Observable<Official> {
    return this.http.patch<Official>(`${this.apiUrl}/${id}/location`, {
      last_latitude: latitude,
      last_longitude: longitude,
      last_gps_update: new Date().toISOString(),
      gps_active: true
    });
  }

  /**
   * Eliminar funcionario
   * DELETE /officials/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
