// user-form.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
})
export class UserFormComponent implements OnInit {
  @Input() user?: User;                          // undefined = crear, definido = editar
  @Output() formSubmit = new EventEmitter<User>(); // el padre decide qué hacer

  form!: FormGroup;
  isEditMode = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.isEditMode = !!this.user;

    this.form = this.fb.group({
      name:     [this.user?.name     ?? '', Validators.required],
      username: [this.user?.username ?? '', Validators.required],
      email:    [this.user?.email    ?? '', [Validators.required, Validators.email]],
      phone:    [this.user?.phone    ?? ''],
      website:  [this.user?.website  ?? ''],
    });
  }

  onSubmit() {
    console.log('Formulario enviado con valores:', this.form.value);
    if (this.form.invalid) return;

    const payload: User = {
      ...this.user,          // conserva el id si existe
      ...this.form.value,
    };

    this.formSubmit.emit(payload);
  }
}