import { Injectable } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';

const googleAuthConfig: AuthConfig = {
  issuer: 'https://accounts.google.com',
  strictDiscoveryDocumentValidation: false,
  clientId: '780821760557-ufbmkdcoffc3vc0eo164k2trq3e4s30r.apps.googleusercontent.com',
  redirectUri: 'http://localhost:4200',
  scope: 'openid profile email',
  responseType: 'token id_token',
  showDebugInformation: false,
};

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

@Injectable({
  providedIn: 'root',
})
export class GoogleAuthService {
  constructor(private oauthService: OAuthService, private router: Router) {
    this.oauthService.configure(googleAuthConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin();
  }

  /**
   * Redirige al usuario a Google para autenticarse.
   */
  loginWithGoogle(): void {
    this.oauthService.initImplicitFlow();
  }

  /**
   * Devuelve true si el usuario tiene un token válido.
   */
  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  /**
   * Devuelve los datos del usuario autenticado.
   */
  getUserProfile(): GoogleUserProfile | null {
    const claims = this.oauthService.getIdentityClaims() as any;
    if (!claims) return null;
    return {
      name: claims['name'],
      email: claims['email'],
      picture: claims['picture'],
      sub: claims['sub'],
    };
  }

  /**
   * Devuelve el id_token para enviarlo al backend si es necesario.
   */
  getIdToken(): string {
    return this.oauthService.getIdToken();
  }

  /**
   * Cierra sesión en Google y limpia el token local.
   */
  logout(): void {
    this.oauthService.logOut();
  }
}