import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { AnnotationCategory } from '../models/annotation-category';

@Injectable({
  providedIn: 'root'
})
export class AnnotationCategoriesService {

  private readonly apiUrl = `${environment.apiUrl}/api/annotation-categories`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las relaciones anotación-categoría
   * GET /annotation-categories
   */
  getAll(): Observable<AnnotationCategory[]> {
    return this.http.get<AnnotationCategory[]>(this.apiUrl);
  }

  /**
   * Obtener relación por ID
   * GET /annotation-categories/:id
   */
  getById(id: number): Observable<AnnotationCategory> {
    return this.http.get<AnnotationCategory>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener categorías asociadas a una anotación
   * GET /annotation-categories?id_annotation=
   */
  getByAnnotation(idAnnotation: number): Observable<AnnotationCategory[]> {
    const params = new HttpParams().set('id_annotation', String(idAnnotation));
    return this.http.get<AnnotationCategory[]>(this.apiUrl, { params });
  }

  /**
   * Obtener anotaciones asociadas a una categoría
   * GET /annotation-categories?id_category=
   */
  getByCategory(idCategory: number): Observable<AnnotationCategory[]> {
    const params = new HttpParams().set('id_category', String(idCategory));
    return this.http.get<AnnotationCategory[]>(this.apiUrl, { params });
  }

  /**
   * Crear relación anotación-categoría
   * POST /annotation-categories
   */
  create(annotationCategory: Omit<AnnotationCategory, 'id_annotation_category'>): Observable<AnnotationCategory> {
    return this.http.post<AnnotationCategory>(this.apiUrl, annotationCategory);
  }

  /**
   * Actualizar relación anotación-categoría
   * PUT /annotation-categories/:id
   */
  update(id: number, annotationCategory: AnnotationCategory): Observable<AnnotationCategory> {
    return this.http.put<AnnotationCategory>(`${this.apiUrl}/${id}`, annotationCategory);
  }

  /**
   * Eliminar relación anotación-categoría
   * DELETE /annotation-categories/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}