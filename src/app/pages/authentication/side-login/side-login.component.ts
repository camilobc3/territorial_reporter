import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { MaterialModule } from 'src/app/material.module';
import { AuthService } from 'src/app/services/auth.service';
import { SecurityService } from 'src/app/services/security.service';

@Component({
  selector: 'app-side-login',
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule
  ],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {

  loadingGoogle = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private securityService: SecurityService,
    private router: Router
  ) {}

  async loginWithGoogle(): Promise<void> {
    try {
      this.loadingGoogle = true;
      this.errorMessage = '';

      const firebaseUser = await this.authService.loginWithGoogle();

      const storedUser = this.authService.getUserFromLocalStorage();

      if (storedUser) {
        this.securityService.setUserFromFirebase(storedUser);
      } else {
        this.securityService.setUser({
          name: firebaseUser.displayName || firebaseUser.email || 'Usuario',
          email: firebaseUser.email || ''
        });
      }

      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error iniciando sesión con Google:', error);
      this.errorMessage = 'No se pudo iniciar sesión con Google.';
    } finally {
      this.loadingGoogle = false;
    }
  }
}
