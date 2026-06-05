import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { City } from '../../../../models/city';
import { Department } from '../../../../models/department';
import { DepartmentService } from '../../../../services/department.service';

@Component({
  selector: 'app-city-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
  ],
  templateUrl: './city-form.component.html',
})
export class CityFormComponent implements OnInit {
  @Input() city?: City;
  @Output() formSubmit = new EventEmitter<City>();

  form!: FormGroup;
  isEditMode = false;
  departments: Department[] = [];

  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder, private router: Router, private departmentService: DepartmentService) {}

  ngOnInit() {
    this.isEditMode = !!this.city;
    this.form = this.fb.group({
      id_department: [this.city?.id_department ?? null, Validators.required],
      name:          [this.city?.name          ?? '',   Validators.required],
      dane_code:     [this.city?.dane_code      ?? ''],
    });

    this.departmentService.getAll().subscribe({
      next: (data: any) => {
        this.departments = Array.isArray(data) ? data : (data.data ?? []);
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    const payload: City = { ...this.city, ...this.form.value };
    this.formSubmit.emit(payload);
  }

  onCancel() {
    this.router.navigate(['/geography/cities/list']);
  }
}