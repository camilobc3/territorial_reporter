import { Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { UpdateComponent } from './update/update.component';
import { CreateComponent } from './create/create.component';

export const EntitiesRoutes: Routes = [
  {
    path: 'list',
    component: ListComponent,
  },
  {
    path: 'create',
    component: CreateComponent,
  },
  {
    path: 'update/:id',
    component: UpdateComponent,
  }
];