import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Department } from '../../../../models/department';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-department-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './department-form.component.html',
})
export class DepartmentFormComponent implements OnInit {
  @Input() department?: Department;
  @Output() formSubmit = new EventEmitter<Department>();

  form!: FormGroup;
  isEditMode = false;

  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit() {
    this.isEditMode = !!this.department;
    this.form = this.fb.group({
      name:      [this.department?.name      ?? '', Validators.required],
      dane_code: [this.department?.dane_code ?? ''],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const payload: Department = { ...this.department, ...this.form.value };
    this.formSubmit.emit(payload);
  }

  onCancel() {
    this.router.navigate(['/geography/departments/list']);
  }
}