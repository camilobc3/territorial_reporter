import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private api = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);


  constructor(private http: HttpClient) { }



  login(user: User): Observable<any> {
    const url = `${this.api}/api/auth/login`;
    return this.http.post<any>(url, user, { withCredentials: true }).pipe(
      tap(() => console.log('✅ Login exitoso, llamando /me...')),
      switchMap(() =>
        this.me().pipe(
          tap((u) => {
            console.log('✅ /me respondió:', u);
            this.setUser(u);
          }),
          catchError((err) => {
            console.error('❌ /me falló:', err.status, err.error);
            this.setUser(null);
            return of(null);
          })
        )
      )
    );
  }

  logout(): Observable<any> {
    const url = `${this.api}/api/auth/logout`;
    return this.http.post(url, {}, { withCredentials: true }).pipe(
      tap(() => this.clearUser())
    );
  }

  me(): Observable<User> {
    const url = `${this.api}/api/auth/me`;
    return this.http.get<User>(url, { withCredentials: true });
  }

  /** Devuelve el observable público del usuario actual */
  public getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }


  setUser(user: User | null) {
    console.log('🔐 Estableciendo usuario actual:', user);
    this.currentUserSubject.next(user);
  }

  clearUser() {
    this.currentUserSubject.next(null);
  }
}
