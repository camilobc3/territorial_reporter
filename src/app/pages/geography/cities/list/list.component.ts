import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { CityService } from '../../../../services/city.service';
import { DepartmentService } from '../../../../services/department.service';
import { City } from '../../../../models/city';
import { Department } from '../../../../models/department';
import { DynamicTableComponent } from '../../../../components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from '../../../../models/component-dynamic-table/column-def';
import { ActionButton } from '../../../../models/component-dynamic-table/action-button';
import { TablePageEvent } from '../../../../models/component-dynamic-table/table-page-event';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-city-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent, RouterModule, MaterialModule],
  templateUrl: './list.component.html',
})
export class CityListComponent implements OnInit {

  cities: City[] = [];
  loading = false;
  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  selectedDepartmentId?: number;
  departments: Department[] = [];

  columns: ColumnDef[] = [
    { header: 'ID',           key: 'id_city'        },
    { header: 'Nombre',       key: 'name'            },
    { header: 'Código DANE',  key: 'dane_code'       },
    { header: 'Departamento', key: 'id_department'   },
  ];

  actions: ActionButton[] = [
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
    private cityService: CityService,
    private departmentService: DepartmentService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.selectedDepartmentId = params['id_department'] ? Number(params['id_department']) : undefined;
      this.loadCities();
    });

    this.departmentService.getAll().subscribe({
      next: (data: any) => {
        this.departments = Array.isArray(data) ? data : (data.data ?? []);
      },
    });
  }

  loadCities(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.cityService.getPaged(page, pageSize, this.selectedDepartmentId).subscribe({
      next: (resp) => {
        this.cities     = resp.data ?? [];
        this.page       = resp.page ?? page;
        this.pageSize   = resp.pageSize ?? pageSize;
        this.total      = resp.totalItems ?? this.cities.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading    = false;
      },
      error: () => {
        this.cities     = [];
        this.total      = 0;
        this.totalPages = 1;
        this.loading    = false;
      },
    });
  }

  onDepartmentChange(idDepartment: number | undefined): void {
    this.selectedDepartmentId = idDepartment;
    this.page = 1;
    this.router.navigate([], {
      queryParams: idDepartment ? { id_department: idDepartment } : {},
    });
  }

  onPageChange(event: TablePageEvent): void {
    this.page     = event.page;
    this.pageSize = event.pageSize;
    this.loadCities(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: City }): void {
    const { actionId, row } = event;
    if (actionId === 'edit') {
      this.router.navigate([`/geography/cities/update/${row.id_city}`]);
    } else if (actionId === 'delete') {
      this.delete(row);
    }
  }

  delete(city: City): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar la ciudad "${city.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cityService.delete(city.id_city!).subscribe({
          next: () => {
            Swal.fire('Eliminada', `La ciudad "${city.name}" fue eliminada.`, 'success');
            this.loadCities();
          },
        });
      }
    });
  }
}