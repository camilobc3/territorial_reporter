import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environments';
import { Entity } from '../models/entity';

export interface PagedResponse {
  data: Entity[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root',
})
export class EntitiesService {

  private readonly apiUrl = `${environment.apiUrl}/api/entities`;

  constructor(private http: HttpClient) {}

  getPaged(
    page: number,
    pageSize: number
  ): Observable<PagedResponse> {

    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((resp) => {

        // Caso 1: backend devuelve array plano
        if (Array.isArray(resp)) {
          return {
            data: resp as Entity[],
            page: 1,
            pageSize: resp.length,
            totalItems: resp.length,
            totalPages: 1,
          };
        }

        // Caso 2: backend devuelve { items, page, ... }
        if (resp?.items) {
          return {
            data: resp.items as Entity[],
            page: resp.page ?? 1,
            pageSize: resp.pageSize ?? pageSize,
            totalItems: resp.totalItems ?? resp.items.length,
            totalPages: resp.totalPages ?? 1,
          };
        }

        // Caso 3: backend devuelve { data, page, ... }
        if (resp?.data) {
          return {
            data: resp.data as Entity[],
            page: resp.page ?? 1,
            pageSize: resp.pageSize ?? pageSize,
            totalItems: resp.totalItems ?? resp.data.length,
            totalPages: resp.totalPages ?? 1,
          };
        }

        // Respuesta inesperada
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

  getById(id: number): Observable<Entity> {
    return this.http.get<Entity>(`${this.apiUrl}/${id}`);
  }

  create(data: FormData): Observable<Entity> {
    return this.http.post<Entity>(this.apiUrl, data);
  }

  update(id: number, data: FormData): Observable<Entity> {
    return this.http.put<Entity>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}