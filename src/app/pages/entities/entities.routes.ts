import { Routes } from '@angular/router';
import { EntityListComponent } from './list/list.component';

export const EntityRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: EntityListComponent
      }
    ]
  }
];