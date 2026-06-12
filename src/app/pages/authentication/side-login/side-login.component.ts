import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { GoogleAuthService } from '../../../services/google-auth.service';

@Component({
  selector: 'app-side-login',
  imports: [RouterModule, MaterialModule],
  templateUrl: './side-login.component.html',
})
export class AppSideLoginComponent {
  constructor(private googleAuth: GoogleAuthService) {}

  loginWithGoogle(): void {
    this.googleAuth.loginWithGoogle();
  }
}