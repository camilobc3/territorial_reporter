import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Entity } from '../models/entity';

@Injectable({
  providedIn: 'root',
})
export class EntityService {

  private readonly apiUrl =
    `${environment.apiUrl}/api/entities`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Entity[]> {
    return this.http.get<Entity[]>(this.apiUrl);
  }

  getPaged(
    page: number,
    pageSize: number
  ): Observable<{
    data: Entity[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', page)
      .set('pageSize', pageSize);

    return this.http.get<{
      data: Entity[];
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    }>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Entity> {
    return this.http.get<Entity>(
      `${this.apiUrl}/${id}`
    );
  }

  create(data: FormData | Entity): Observable<Entity> {
    return this.http.post<Entity>(
      this.apiUrl,
      data
    );
  }

  update(
    id: number,
    data: FormData | Entity
  ): Observable<Entity> {
    return this.http.put<Entity>(
      `${this.apiUrl}/${id}`,
      data
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`
    );
  }
}