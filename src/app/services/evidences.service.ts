import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Evidence } from '../models/evidence';

@Injectable({
  providedIn: 'root'
})
export class EvidencesService {

  private readonly apiUrl = `${environment.apiUrl}/api/evidences`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todas las evidencias
   * GET /evidences
   */
  getAll(): Observable<Evidence[]> {
    return this.http.get<Evidence[]>(this.apiUrl);
  }

  /**
   * Obtener evidencia por ID
   * GET /evidences/:id
   */
  getById(id: number): Observable<Evidence> {
    return this.http.get<Evidence>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener evidencias de una anotación
   * GET /evidences?id_annotation=
   */
  getByAnnotation(idAnnotation: number): Observable<Evidence[]> {
    const params = new HttpParams().set('id_annotation', String(idAnnotation));
    return this.http.get<Evidence[]>(this.apiUrl, { params });
  }

  /**
   * Crear evidencia
   * POST /evidences
   */
  create(evidence: Omit<Evidence, 'id_evidence'>): Observable<Evidence> {
    return this.http.post<Evidence>(this.apiUrl, evidence);
  }

  /**
   * Subir archivo de evidencia (multipart/form-data)
   * POST /evidences/upload
   */
  upload(idAnnotation: number, file: File): Observable<Evidence> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_annotation', String(idAnnotation));
    return this.http.post<Evidence>(`${this.apiUrl}/upload`, formData);
  }

  /**
   * Actualizar evidencia completa
   * PUT /evidences/:id
   */
  update(id: number, evidence: Evidence): Observable<Evidence> {
    return this.http.put<Evidence>(`${this.apiUrl}/${id}`, evidence);
  }

  /**
   * Eliminar evidencia
   * DELETE /evidences/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}