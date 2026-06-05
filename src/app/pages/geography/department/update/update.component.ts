import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentFormComponent } from '../department-form/department-form.component';
import { DepartmentService } from '../../../../services/department.service';
import { Department } from '../../../../models/department';

@Component({
  selector: 'app-department-update',
  standalone: true,
  imports: [DepartmentFormComponent],
  template: `
    @if (department) {
      <app-department-form [department]="department" (formSubmit)="onUpdate($event)" />
    } @else {
      <p>Cargando departamento...</p>
    }
  `,
})
export class DepartmentUpdateComponent implements OnInit {
  department?: Department;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: DepartmentService,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;
    if (isNaN(this.id)) { this.router.navigate(['/geography/departments/list']); return; }

    this.service.getById(this.id).subscribe({
      next: (d) => (this.department = d),
      error: () => this.router.navigate(['/geography/departments/list']),
    });
  }

  onUpdate(formValue: Department) {
    this.service.update(this.id, { ...formValue, id_department: this.id }).subscribe(() => {
      this.router.navigate(['/geography/departments/list']);
    });
  }
}