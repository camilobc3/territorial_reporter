import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-list',
  imports: [],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent  implements OnInit, OnDestroy {
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
