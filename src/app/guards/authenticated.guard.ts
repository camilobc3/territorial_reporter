import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements CanActivate, CanActivateChild {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.validateAuthentication();
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.validateAuthentication();
  }

  private validateAuthentication(): boolean | UrlTree {
    if (this.authService.hasStoredSession()) {
      return true;
    }

    return this.router.createUrlTree(['/authentication/login']);
  }
}
