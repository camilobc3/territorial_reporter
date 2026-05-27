# Guardianes

```
ng g guard guards/authenticated
ng g guard guards/no-authenticated
```

Se debe seleccionar el tipo "Can Activate".
Programar en el archivo

``` ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SecurityService } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticatedGuard implements  CanActivateChild {

  constructor(private securityService: SecurityService,
    private router: Router
  ) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.securityService.me().pipe(
      tap((user) => this.securityService.setUser(user)),
      map((user) => !!user),
      catchError(() => {
        this.router.navigate(['/authentication/login']);
        this.securityService.clearUser();
        return of(false);
      })
    );
  }

}

```

Ahora el siguiente código

``` ts

import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { SecurityService } from '../services/security.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthenticatedGuard implements  CanActivateChild {

  constructor(private securityService: SecurityService,
    private router: Router
  ) {}

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.securityService.me().pipe(
      tap((user) => this.securityService.setUser(user)),
      map((user) => !user),
      catchError(() => {
        this.router.navigate(['/authentication/login']);
        this.securityService.clearUser();
        return of(true);
      })
    );
  }

}
```


Por último en las rutas

```
{
    path: 'users',
    canActivate: [AuthenticatedGuard],
    loadChildren: () => import('./users/users.routes').then((m) => m.UserRoutes)
  }
```