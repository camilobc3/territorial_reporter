import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private readonly apiUrl = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las categorías
   * GET /categories
   */
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  /**
   * Obtener categorías paginadas
   * GET /categories?page=&pageSize=
   */
  getPaged(page: number, pageSize: number): Observable<{
    data: Category[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<{
      data: Category[];
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    }>(this.apiUrl, { params });
  }

  /**
   * Obtener categoría por ID
   * GET /categories/:id
   */
  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener subcategorías de una categoría padre
   * GET /categories?id_parent_category=
   */
  getByParent(idParentCategory: number): Observable<Category[]> {
    const params = new HttpParams().set('id_parent_category', String(idParentCategory));
    return this.http.get<Category[]>(this.apiUrl, { params });
  }

  /**
   * Obtener solo categorías raíz (sin padre)
   * GET /categories?id_parent_category=null
   */
  getRootCategories(): Observable<Category[]> {
    const params = new HttpParams().set('id_parent_category', 'null');
    return this.http.get<Category[]>(this.apiUrl, { params });
  }

  /**
   * Crear categoría
   * POST /categories
   */
  create(category: Omit<Category, 'id_category'>): Observable<Category> {
    return this.http.post<Category>(this.apiUrl, category);
  }

  /**
   * Actualizar categoría completa
   * PUT /categories/:id
   */
  update(id: number, category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}`, category);
  }

  /**
   * Eliminar categoría
   * DELETE /categories/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}