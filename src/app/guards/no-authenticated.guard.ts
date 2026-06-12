import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';

import { StorageService } from '../services/storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthenticatedGuard implements CanActivate, CanActivateChild {

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.validateNoAuthentication();
  }

  canActivateChild(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    return this.validateNoAuthentication();
  }

  private validateNoAuthentication(): boolean | UrlTree {
    const token = this.storageService.getItem('firebase_token');

    if (!token) {
      return true;
    }

    return this.router.createUrlTree(['/dashboard']);
  }
}