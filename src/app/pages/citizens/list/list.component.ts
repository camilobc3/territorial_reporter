import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CitizenService } from 'src/app/services/citizen.service';
import { Citizen } from 'src/app/models/citizen';
import { DynamicTableComponent } from 'src/app/components/ui/table/dynamic-table/dynamic-table.component';
import { ColumnDef } from 'src/app/models/component-dynamic-table/column-def';
import { ActionButton } from 'src/app/models/component-dynamic-table/action-button';
import { TablePageEvent } from 'src/app/models/component-dynamic-table/table-page-event';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-citizen-list',
  standalone: true,
  imports: [CommonModule, DynamicTableComponent],
  templateUrl: './list.component.html',
})
export class CitizenListComponent implements OnInit {

  citizens: Citizen[] = [];
  loading = false;

  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  columns: ColumnDef[] = [
    { header: 'ID',        key: 'id_citizen' },
    { header: 'Nombre',    key: 'name'       },
    { header: 'Email',     key: 'email'      },
    { header: 'Teléfono',  key: 'phone'      },
    { header: 'Estado',    key: 'status'     },
  ];

  actions: ActionButton[] = [
    {
      id: 'edit',
      label: 'Editar',
      icon: 'heroPencil',
      class: 'flex-1 px-2 py-1 rounded bg-yellow-400 text-black cursor-pointer flex items-center justify-center gap-1'
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'heroTrash',
      class: 'flex-1 px-2 py-1 rounded bg-red-500 text-white cursor-pointer flex items-center justify-center gap-1'
    }
  ];

  constructor(
    private citizenService: CitizenService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCitizens();
  }

  loadCitizens(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.citizenService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.citizens   = resp.data       || [];
        this.page       = resp.page       || page;
        this.pageSize   = resp.pageSize   || pageSize;
        this.total      = resp.totalItems ?? this.citizens.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading    = false;
      },
      error: () => {
        this.citizens   = [];
        this.total      = 0;
        this.totalPages = 1;
        this.loading    = false;
      }
    });
  }

  onPageChange(event: TablePageEvent): void {
    this.page     = event.page;
    this.pageSize = event.pageSize;
    this.loadCitizens(this.page, this.pageSize);
  }

  onTableAction(event: { actionId: string; row: Citizen }): void {
    const { actionId, row } = event;
    if (actionId === 'edit') {
      this.router.navigate([`/citizens/update/${row.id_citizen}`]);
    } else if (actionId === 'delete') {
      this.delete(row);
    }
  }

  delete(citizen: Citizen): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar al ciudadano "${citizen.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.citizenService.delete(citizen.id_citizen!).subscribe({
          next: () => {
            Swal.fire('Eliminado', `El ciudadano "${citizen.name}" ha sido eliminado.`, 'success');
            this.loadCitizens();
          }
        });
      }
    });
  }
}