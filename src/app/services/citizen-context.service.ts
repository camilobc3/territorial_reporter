import { Injectable } from '@angular/core';
import { Observable, map, switchMap, take, throwError } from 'rxjs';

import { SecurityService } from './security.service';
import { CitizenService } from './citizen.service';

@Injectable({
  providedIn: 'root'
})
export class CitizenContextService {

  constructor(
    private securityService: SecurityService,
    private citizenService: CitizenService
  ) {}

  getCurrentCitizenId(): Observable<number> {
    return this.securityService.getCurrentUser().pipe(
      take(1),
      switchMap((user) => {
        if (!user?.email) {
          return throwError(() => new Error('No hay usuario autenticado con correo.'));
        }

        return this.citizenService.getPaged(1, 1000).pipe(
          map((resp) => {
            const citizen = resp.data.find(
              item => item.email?.toLowerCase() === user.email?.toLowerCase()
            );

            if (!citizen?.id_citizen) {
              throw new Error('El usuario autenticado no está registrado como ciudadano.');
            }

            return citizen.id_citizen;
          })
        );
      })
    );
  }
}