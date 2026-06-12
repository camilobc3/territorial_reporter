import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { User } from '../models/user';
import { StorageService } from './storage/storage.service';
import { GoogleUserProfile } from './google-auth.service';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {
  private api = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly storageKey = 'currentUser';

  constructor(private http: HttpClient, private storage: StorageService) {
    try {
      const raw = this.storage.getItem(this.storageKey);
      if (raw) {
        const u: User = JSON.parse(raw);
        this.currentUserSubject.next(u);
      }
    } catch (e) {
      console.warn('Failed to load user from localStorage', e);
    }
  }

  /**
   * Establece el usuario en el estado local a partir del perfil de Google.
   * No necesita llamar al backend porque el token ya fue validado por Google.
   */
  setUserFromGoogle(profile: GoogleUserProfile): void {
    const user: User = {
      name: profile.name,
      email: profile.email,
    };
    this.setUser(user);
  }

  public getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  me(): Observable<User> {
    const url = `${this.api}/api/auth/me`;
    return this.http.get<User>(url, { withCredentials: true });
  }

  logout(): Observable<any> {
    const url = `${this.api}/api/auth/logout`;
    return this.http.post(url, {}, { withCredentials: true }).pipe(
      tap(() => this.clearUser())
    );
  }

  setUser(user: User | null) {
    this.currentUserSubject.next(user);
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