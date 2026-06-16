import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';
import { AuthenticatedGuard } from '../guards/authenticated.guard';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Reporte Territorial',
      urls: [
        { title: 'Inicio', url: '/dashboard' },
        { title: 'Reporte Territorial' },
      ],
    },
  },
  {
    path: 'users',
    canActivate: [AuthenticatedGuard],
    loadChildren: () => import('./users/users.routes').then((m) => m.UserRoutes)
  },
  {
    path: 'entity',
    loadChildren: () => import('./entities/entities.routes').then((m) => m.EntitiesRoutes)
  },
  {
    path: 'entities',
    loadChildren: () => import('./entities/entities.routes').then((m) => m.EntitiesRoutes)
  },
  {
    path: 'citizens',
    loadChildren: () => import('./citizens/citizens.routes').then((m) => m.CitizenRoutes)
  },
  {
    path: 'officials',
    loadChildren: () => import('./officials/officials.routes').then((m) => m.OfficialRoutes)
  }
];
