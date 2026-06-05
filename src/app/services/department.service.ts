import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { Department } from '../models/department';

@Injectable({ providedIn: 'root' })
export class DepartmentService {

  private readonly apiUrl = `${environment.apiUrl}/api/departments`;

  constructor(private http: HttpClient) {}

  getPaged(page: number, pageSize: number): Observable<{
    data: Department[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<any>(this.apiUrl, { params });
  }

  getAll(): Observable<Department[]> {
    return this.http.get<Department[]>(this.apiUrl);
  }

  getById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  create(department: Omit<Department, 'id_department'>): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department);
  }

  update(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}