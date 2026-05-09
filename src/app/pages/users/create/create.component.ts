import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserFormComponent } from '../components/user-form/user-form.component';
import { User } from '../../../models/user';
import { UsersService } from 'src/app/services/users.service';


@Component({
  selector: 'app-create',
  imports: [UserFormComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent {

  constructor(
    private router: Router,
    private userService: UsersService
  ) { }

  onCreate(formValue: Partial<User>) {
    console.log('Crear usuario con datos:', formValue);
    // this.userService.create(formValue).subscribe(() => {
    //   this.router.navigate(['/users/list']);
    // });
  }
}