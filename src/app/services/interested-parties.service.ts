import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { InterestedParty } from '../models/interested-party';

@Injectable({
  providedIn: 'root'
})
export class InterestedPartiesService {

  private readonly apiUrl = `${environment.apiUrl}/api/interested-parties`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los interesados
   * GET /interested-parties
   */
  getAll(): Observable<InterestedParty[]> {
    return this.http.get<InterestedParty[]>(this.apiUrl);
  }

  /**
   * Obtener interesado por ID
   * GET /interested-parties/:id
   */
  getById(id: number): Observable<InterestedParty> {
    return this.http.get<InterestedParty>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener interesados de una anotación
   * GET /interested-parties?id_annotation=
   */
  getByAnnotation(idAnnotation: number): Observable<InterestedParty[]> {
    const params = new HttpParams().set('id_annotation', String(idAnnotation));
    return this.http.get<InterestedParty[]>(this.apiUrl, { params });
  }

  /**
   * Obtener anotaciones en las que una entidad es interesada
   * GET /interested-parties?id_entity=
   */
  getByEntity(idEntity: number): Observable<InterestedParty[]> {
    const params = new HttpParams().set('id_entity', String(idEntity));
    return this.http.get<InterestedParty[]>(this.apiUrl, { params });
  }

  /**
   * Crear interesado
   * POST /interested-parties
   */
  create(interestedParty: Omit<InterestedParty, 'id_interested_party'>): Observable<InterestedParty> {
    return this.http.post<InterestedParty>(this.apiUrl, interestedParty);
  }

  /**
   * Actualizar interesado completo
   * PUT /interested-parties/:id
   */
  update(id: number, interestedParty: InterestedParty): Observable<InterestedParty> {
    return this.http.put<InterestedParty>(`${this.apiUrl}/${id}`, interestedParty);
  }

  /**
   * Eliminar interesado
   * DELETE /interested-parties/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}