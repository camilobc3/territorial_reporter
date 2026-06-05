import { Routes } from '@angular/router';
import { DepartmentListComponent }   from './department/list/list.component';
import { DepartmentCreateComponent } from './department/create/create.component';
import { DepartmentUpdateComponent } from './department/update/update.component';
import { CityListComponent }         from './cities/list/list.component';
import { CityCreateComponent }       from './cities/create/create.component';
import { CityUpdateComponent }       from './cities/update/update.component';
 
export const GeographyRoutes: Routes = [
  {
    path: '',
    children: [
      // Departamentos
      { path: 'departments/list',        component: DepartmentListComponent   },
      { path: 'departments/create',      component: DepartmentCreateComponent },
      { path: 'departments/update/:id',  component: DepartmentUpdateComponent },
      // Ciudades
      { path: 'cities/list',             component: CityListComponent         },
      { path: 'cities/create',           component: CityCreateComponent       },
      { path: 'cities/update/:id',       component: CityUpdateComponent       },
    ],
  },
];