import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environments';
import { Vote } from '../models/vote';

@Injectable({
  providedIn: 'root'
})
export class VotesService {

  private readonly apiUrl = `${environment.apiUrl}/api/votes`;

  constructor(private http: HttpClient) {}

  /**
   * Obtener todos los votos
   * GET /votes
   */
  getAll(): Observable<Vote[]> {
    return this.http.get<Vote[]>(this.apiUrl);
  }

  /**
   * Obtener voto por ID
   * GET /votes/:id
   */
  getById(id: number): Observable<Vote> {
    return this.http.get<Vote>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener votos de una anotación
   * GET /votes?id_annotation=
   */
  getByAnnotation(idAnnotation: number): Observable<Vote[]> {
    const params = new HttpParams().set('id_annotation', String(idAnnotation));
    return this.http.get<Vote[]>(this.apiUrl, { params });
  }

  /**
   * Obtener votos de un ciudadano
   * GET /votes?id_citizen=
   */
  getByCitizen(idCitizen: number): Observable<Vote[]> {
    const params = new HttpParams().set('id_citizen', String(idCitizen));
    return this.http.get<Vote[]>(this.apiUrl, { params });
  }

  /**
   * Obtener el voto de un ciudadano sobre una anotación específica
   * GET /votes?id_citizen=&id_annotation=
   */
  getByCitizenAndAnnotation(idCitizen: number, idAnnotation: number): Observable<Vote[]> {
    const params = new HttpParams()
      .set('id_citizen', String(idCitizen))
      .set('id_annotation', String(idAnnotation));
    return this.http.get<Vote[]>(this.apiUrl, { params });
  }

  /**
   * Crear voto
   * POST /votes
   */
  create(vote: Omit<Vote, 'id_vote'>): Observable<Vote> {
    return this.http.post<Vote>(this.apiUrl, vote);
  }

  /**
   * Actualizar voto completo (editar calificación existente)
   * PUT /votes/:id
   */
  update(id: number, vote: Vote): Observable<Vote> {
    return this.http.put<Vote>(`${this.apiUrl}/${id}`, vote);
  }

  /**
   * Eliminar voto
   * DELETE /votes/:id
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}