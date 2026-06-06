import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environments';
import { Citizen } from '../models/citizen';

export interface PagedCitizenResponse {
  data: Citizen[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class CitizenService {

  private readonly apiUrl = `${environment.apiUrl}/api/citizens`;

  constructor(private http: HttpClient) {}

  getPaged(
    page: number,
    pageSize: number
  ): Observable<PagedCitizenResponse> {

    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((resp) => {

        // Caso 1: array plano
        if (Array.isArray(resp)) {
          return {
            data: resp,
            page: 1,
            pageSize: resp.length,
            totalItems: resp.length,
            totalPages: 1
          };
        }

        // Caso 2: backend devuelve items
        if (resp?.items) {
          return {
            data: resp.items,
            page: resp.page ?? 1,
            pageSize: resp.pageSize ?? pageSize,
            totalItems: resp.totalItems ?? resp.items.length,
            totalPages: resp.totalPages ?? 1
          };
        }

        // Caso 3: backend devuelve data
        if (resp?.data) {
          return {
            data: resp.data,
            page: resp.page ?? 1,
            pageSize: resp.pageSize ?? pageSize,
            totalItems: resp.totalItems ?? resp.data.length,
            totalPages: resp.totalPages ?? 1
          };
        }

        // Respuesta inesperada
        return {
          data: [],
          page: 1,
          pageSize,
          totalItems: 0,
          totalPages: 1
        };
      })
    );
  }

  getById(id: number): Observable<Citizen> {
    return this.http.get<Citizen>(`${this.apiUrl}/${id}`);
  }

  create(citizen: Omit<Citizen, 'id_citizen'>): Observable<Citizen> {
    return this.http.post<Citizen>(this.apiUrl, citizen);
  }

  update(id: number, citizen: Citizen): Observable<Citizen> {
    return this.http.put<Citizen>(`${this.apiUrl}/${id}`, citizen);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}