import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DepartmentService } from '../../../../services/department.service';
import { Department } from '../../../../models/department';
import { DynamicTableComponent } from '../../../../components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from '../../../../models/component-dynamic-table/column-def';
import { ActionButton } from '../../../../models/component-dynamic-table/action-button';
import { TablePageEvent } from '../../../../models/component-dynamic-table/table-page-event';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent],
  templateUrl: './list.component.html',
})
export class DepartmentListComponent implements OnInit {

  departments: Department[] = [];
  loading = false;
  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  columns: ColumnDef[] = [
    { header: 'ID',          key: 'id_department' },
    { header: 'Nombre',      key: 'name'          },
    { header: 'Código DANE', key: 'dane_code'     },
  ];

  actions: ActionButton[] = [
    {
      id: 'cities',
      label: 'Ciudades',
      icon: 'heroMapPin',
      class: 'flex-1 px-2 py-1 rounded bg-indigo-500 text-white cursor-pointer flex items-center justify-center gap-1',
    },
    {
      id: 'edit',
      label: 'Editar',
      icon: 'heroPencil',
      class: 'flex-1 px-2 py-1 rounded bg-yellow-400 text-black cursor-pointer flex items-center justify-center gap-1',
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'heroTrash',
      class: 'flex-1 px-2 py-1 rounded bg-red-500 text-white cursor-pointer flex items-center justify-center gap-1',
    },
  ];

  constructor(
    private departmentService: DepartmentService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.departmentService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.departments = resp.data ?? [];
        this.page       = resp.page ?? page;
        this.pageSize   = resp.pageSize ?? pageSize;
        this.total      = resp.totalItems ?? this.departments.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading    = false;
      },
      error: () => {
        this.departments = [];
        this.total       = 0;
        this.totalPages  = 1;
        this.loading     = false;
      },
    });
  }

  onPageChange(event: TablePageEvent): void {
    this.page     = event.page;
    this.pageSize = event.pageSize;
    this.loadDepartments(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: Department }): void {
    const { actionId, row } = event;
    if (actionId === 'cities') {
      this.router.navigate(['/geography/cities/list'], {
        queryParams: { id_department: row.id_department },
      });
    } else if (actionId === 'edit') {
      this.router.navigate([`/geography/departments/update/${row.id_department}`]);
    } else if (actionId === 'delete') {
      this.delete(row);
    }
  }

  delete(department: Department): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar el departamento "${department.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.departmentService.delete(department.id_department!).subscribe({
          next: () => {
            Swal.fire('Eliminado', `El departamento "${department.name}" fue eliminado.`, 'success');
            this.loadDepartments();
          },
        });
      }
    });
  }
}