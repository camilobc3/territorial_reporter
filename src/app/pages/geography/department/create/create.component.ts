import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DepartmentFormComponent } from '../department-form/department-form.component';
import { DepartmentService } from '../../../../services/department.service';
import { Department } from '../../../../models/department';

@Component({
  selector: 'app-department-create',
  standalone: true,
  imports: [DepartmentFormComponent],
  template: `<app-department-form (formSubmit)="onCreate($event)" />`,
})
export class DepartmentCreateComponent {
  constructor(private service: DepartmentService, private router: Router) {}

  onCreate(formValue: Department) {
    this.service.create(formValue).subscribe(() => {
      this.router.navigate(['/geography/departments/list']);
    });
  }
}