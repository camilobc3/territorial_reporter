import { Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signOut,
  User,
  user
} from '@angular/fire/auth';

import { Observable } from 'rxjs';
import { StorageService } from './storage/storage.service';
import { FirebaseStoredUser } from '../models/auth/firebase-stored-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly TOKEN_KEY = 'firebase_token';
  private readonly USER_KEY = 'firebase_user';

  user$: Observable<User | null>;

  constructor(
    private auth: Auth,
    private storageService: StorageService
  ) {
    this.user$ = user(this.auth);
  }

  async loginWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(this.auth, provider);

    const firebaseUser = result.user;

    const token = await firebaseUser.getIdToken();

    this.storageService.setItem(this.TOKEN_KEY, token);

    const storedUser: FirebaseStoredUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL
    };

    this.storageService.setObject(this.USER_KEY, storedUser);

    return firebaseUser;
  }

  async loginWithGithub(): Promise<User> {
    const provider = new GithubAuthProvider();

    const result = await signInWithPopup(this.auth, provider);

    const firebaseUser = result.user;

    const token = await firebaseUser.getIdToken();

    this.storageService.setItem(this.TOKEN_KEY, token);

    const storedUser: FirebaseStoredUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL
    };

    this.storageService.setObject(this.USER_KEY, storedUser);

    return firebaseUser;
  }

  async logout(): Promise<void> {
    this.storageService.removeItem(this.TOKEN_KEY);
    this.storageService.removeItem(this.USER_KEY);

    return signOut(this.auth);
  }

  getTokenFromLocalStorage(): string | null {
    return this.storageService.getItem(this.TOKEN_KEY);
  }

  getUserFromLocalStorage(): FirebaseStoredUser | null {
    return this.storageService.getObject<FirebaseStoredUser>(this.USER_KEY);
  }

  async getIdToken(): Promise<string | null> {
    const currentUser = this.auth.currentUser;

    if (!currentUser) {
      return this.storageService.getItem(this.TOKEN_KEY);
    }

    const token = await currentUser.getIdToken();

    this.storageService.setItem(this.TOKEN_KEY, token);

    return token;
  }
}