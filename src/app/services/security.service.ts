import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { User } from '../models/user';
import { IStorageService } from './storage/storage.service.interface';
import { StorageService } from './storage/storage.service';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private api = environment.apiUrl;

  private currentUserSubject = new BehaviorSubject<User | null>(null);

  private readonly storageKey = 'currentUser';

  constructor(private http: HttpClient, private storage: StorageService) {
    // Al crear el servicio, intentar cargar usuario persistido
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (raw) {
        const u: User = JSON.parse(raw);
        this.currentUserSubject.next(u);
      }
    } catch (e) {
      // ignore parse errors
      console.warn('Failed to load user from localStorage', e);
    }
  }



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
    // Persistir en storage (no almacenar password)
    try {
      if (user) {
        const copy: any = { ...user };
        if ('password' in copy) delete copy.password;
        this.storage.setItem(this.storageKey, JSON.stringify(copy));
      } else {
        this.storage.removeItem(this.storageKey);
      }
    } catch (e) {
      console.warn('Failed to persist user to storage', e);
    }
  }

  clearUser() {
    this.currentUserSubject.next(null);
    try {
      this.storage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('Failed to remove user from storage', e);
    }
  }
}
