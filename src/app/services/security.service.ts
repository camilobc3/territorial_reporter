import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { environment } from '../../environments/environments';
import { User } from '../models/user';
import { StorageService } from './storage/storage.service';
import { FirebaseStoredUser } from '../models/auth/firebase-stored-user';

@Injectable({
  providedIn: 'root',
})
export class SecurityService {

  private api = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private readonly storageKey = 'currentUser';

  constructor(
    private http: HttpClient,
    private storage: StorageService
  ) {
    try {
      const user = this.storage.getObject<User>(this.storageKey);

      if (user) {
        this.currentUserSubject.next(user);
      }
    } catch (error) {
      console.warn('Failed to load user from localStorage', error);
    }
  }

  public getCurrentUser(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  setUserFromFirebase(firebaseUser: FirebaseStoredUser): void {
    const user: User = {
      name: firebaseUser.displayName || firebaseUser.email || 'Usuario',
      email: firebaseUser.email || ''
    };

    this.setUser(user);
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

  setUser(user: User | null): void {
    this.currentUserSubject.next(user);

    try {
      if (user) {
        const copy: any = { ...user };

        if ('password' in copy) {
          delete copy.password;
        }

        this.storage.setObject(this.storageKey, copy);
      } else {
        this.storage.removeItem(this.storageKey);
      }
    } catch (error) {
      console.warn('Failed to persist user to storage', error);
    }
  }

  clearUser(): void {
    this.currentUserSubject.next(null);

    try {
      this.storage.removeItem(this.storageKey);
    } catch (error) {
      console.warn('Failed to remove user from storage', error);
    }
  }
}