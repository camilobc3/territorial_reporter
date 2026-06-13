import { Routes } from '@angular/router';

import { BlankComponent } from './layouts/blank/blank.component';
import { FullComponent } from './layouts/full/full.component';

import { AuthenticatedGuard } from './guards/authenticated.guard';
import { NoAuthenticatedGuard } from './guards/no-authenticated.guard';

export const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivateChild: [AuthenticatedGuard],
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/pages.routes').then((m) => m.PagesRoutes),
      },
      {
        path: 'entity',
        loadChildren: () =>
          import('./pages/entities/entities.routes').then((m) => m.EntitiesRoutes),
      },
      {
        path: 'entities',
        loadChildren: () =>
          import('./pages/entities/entities.routes').then((m) => m.EntitiesRoutes),
      },
      {
        path: 'officials',
        loadChildren: () =>
          import('./pages/officials/officials.routes').then((m) => m.OfficialRoutes),
      },
      {
        path: 'citizens',
        loadChildren: () =>
          import('./pages/citizens/citizens.routes').then((m) => m.CitizenRoutes),
      },
      {
        path: 'ui-components',
        loadChildren: () =>
          import('./pages/ui-components/ui-components.routes').then(
            (m) => m.UiComponentsRoutes
          ),
      },
      {
        path: 'extra',
        loadChildren: () =>
          import('./pages/extra/extra.routes').then((m) => m.ExtraRoutes),
      },
      {
        path: 'users',
        loadChildren: () =>
          import('./pages/users/users.routes').then((m) => m.UserRoutes),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('./pages/categories/categories.routes').then(
            (m) => m.categoriesRoutes
          ),
      },
      {
        path: 'communes',
        loadChildren: () =>
          import('./pages/communes/communes.routes').then(
            (m) => m.CommunesRoutes
          ),
      },
      {
        path: 'neighborhoods',
        loadChildren: () => 
          import('./pages/neighborhoods/neighborhoods.routes').then(m => m.NeighborhoodsRoutes)
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./pages/reports/reports.routes').then(
            (m) => m.ReportsRoutes
          ),
      },
      {
        path: 'neighborhoods-map',
        loadChildren: () =>
          import('./pages/neighborhood-map/neighborhood-map.routes').then(
            (m) => m.NeighborhoodsRoutes
          ),
      },
    ],
  },
  {
    path: '',
    component: BlankComponent,
    canActivateChild: [NoAuthenticatedGuard],
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./pages/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'authentication/error',
  },
];