
# Clase 1 Principios Básicos

1. Instalar Angular
```sh
npm -g i  angular/cli
```
2. Creación de la componente

``` sh
ng g c pages/users/list
```
3. Crear un archivo de rutas en caso que no exista en esa carpeta `users`. Hay que hacerlo de forma manual. `pages/users/users.routes.ts`

``` typescript
import { Routes } from '@angular/router';
import { ListComponent } from './list/list.component';


export const UserRoutes: Routes = [
    {
        path: 'list',
        component: ListComponent
    }
];

```

4. Verificar importación de las rutas en proyecto general. `pages/pages.routes.ts`

``` typescript
import { Routes } from '@angular/router';
import { StarterComponent } from './starter/starter.component';

export const PagesRoutes: Routes = [
  {
    path: '',
    component: StarterComponent,
    data: {
      title: 'Starter',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Starter' },
      ],
    },
  },
  // Se debe agregar a los usuarios, para que se importe todas sus rutas
  {
    path: 'users',
    loadChildren: () => import('./users/users.routes').then((m) => m.UserRoutes)
  }
];

```

5. Para crear un modelo se debe aplicar el siguiente comando

``` sh
ng g i models/user
```

En esa clase se programa el modelo con sus atributos

``` typescript
export interface User {
    id?: number;
    name?: string;
    username?: string;
    email?: string;
    phone?: string;
    website?: string;
}
```
6. Programar el controlador de listar usuarios.

``` typescript
import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit, OnDestroy {
  users: User[] = [
    { id: 1, name: 'Juan', username: 'juanperez', email: 'juan.perez@example.com' },
    { id: 2, name: 'María', username: 'mariagomez', email: 'maria.gomez@example.com' }
  ];

  constructor() {}

  ngOnInit(): void {
    console.log('ListComponent initialized');
  }
  ngOnDestroy(): void {
    console.log('ListComponent destroyed');
  }

}
```

7. Ahora programar el listar la componente html

``` html
<h1 class="title">
    Listado de usuarios
</h1>
<table class="table">
    <thead>
        <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
        </tr>
    </thead>
    <tbody>
        @for (user of users; track user.id) {
            <tr>
                <td>{{ user.name }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
            </tr>
        }   
    </tbody>
</table>
```