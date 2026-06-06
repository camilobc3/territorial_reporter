import { Routes } from '@angular/router';
import { CitizenListComponent }   from './list/list.component';
import { CitizenCreateComponent } from './create/create.component';
import { CitizenUpdateComponent } from './update/update.component';
 
export const CitizenRoutes: Routes = [
  { path: 'list',        component: CitizenListComponent   },
  { path: 'create',      component: CitizenCreateComponent },
  { path: 'update/:id',  component: CitizenUpdateComponent },
];