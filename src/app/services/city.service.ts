import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { City } from '../models/city';

@Injectable({ providedIn: 'root' })
export class CityService {

  private readonly apiUrl = `${environment.apiUrl}/api/cities`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl);
  }

  getPaged(page: number, pageSize: number, idDepartment?: number): Observable<{
    data: City[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    if (idDepartment) {
      params = params.set('id_department', String(idDepartment));
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  /**
   * Obtener ciudades por departamento
   * GET /cities?id_department=
   *
   * ⚠️ El backend actualmente ignora el query param `id_department` y
   * devuelve todas las ciudades. Se filtra en el frontend como
   * solución temporal hasta que se corrija el endpoint.
   */
  getByDepartment(idDepartment: number): Observable<City[]> {
    const params = new HttpParams().set('id_department', String(idDepartment));
    return this.http.get<City[]>(this.apiUrl, { params }).pipe(
      map(cities => cities.filter(c => c.id_department === idDepartment))
    );
  }

  getById(id: number): Observable<City> {
    return this.http.get<City>(`${this.apiUrl}/${id}`);
  }

  create(city: Omit<City, 'id_city'>): Observable<City> {
    return this.http.post<City>(this.apiUrl, city);
  }

  update(id: number, city: City): Observable<City> {
    return this.http.put<City>(`${this.apiUrl}/${id}`, city);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}