import { Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';

export const AnnotationsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'create',
    pathMatch: 'full',
  },
  {
    path: 'create',
    component: CreateComponent,
  },
];