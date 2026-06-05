import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { EntityService } from '../../../services/entity.service';
import { Entity } from '../../../models/entity';

import { DynamicTableComponent } from '../../../components/ui/table/dynamic-table/dynamic-table.component';

import { ColumnDef } from '../../../models/component-dynamic-table/column-def';
import { ActionButton } from '../../../models/component-dynamic-table/action-button';
import { TablePageEvent } from '../../../models/component-dynamic-table/table-page-event';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [
    CommonModule,
    DynamicTableComponent
  ],
  templateUrl: './list.component.html',
})
export class EntityListComponent implements OnInit {

  entities: Entity[] = [];

  loading = false;

  page = 1;
  pageSize = 5;

  total = 0;
  totalPages = 1;

  columns: ColumnDef[] = [
    {
      header: 'ID',
      key: 'id_entity',
    },
    {
      header: 'Nombre',
      key: 'name',
    },
    {
      header: 'NIT',
      key: 'nit',
    },
    {
      header: 'Correo',
      key: 'email',
    },
    {
      header: 'Estado',
      key: 'status',
    },
  ];

  actions: ActionButton[] = [
    {
      id: 'edit',
      label: 'Editar',
      icon: 'heroPencil',
      class:
        'flex-1 px-2 py-1 rounded bg-yellow-400 text-black cursor-pointer flex items-center justify-center gap-1',
    },
    {
      id: 'delete',
      label: 'Eliminar',
      icon: 'heroTrash',
      class:
        'flex-1 px-2 py-1 rounded bg-red-500 text-white cursor-pointer flex items-center justify-center gap-1',
    },
  ];

  constructor(
    private entityService: EntityService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadEntities();
  }

  loadEntities(): void {
    this.loading = true;

    this.entityService.getAll().subscribe({
      next: (resp: Entity[]) => {
        this.entities = resp;
        this.total = resp.length;
        this.totalPages = 1;
        this.loading = false;
      },
      error: (err: any) => {
        console.error(err);

        this.entities = [];
        this.total = 0;
        this.totalPages = 1;
        this.loading = false;
      },
    });
  }

  onPageChange(
    event: TablePageEvent
  ): void {
    this.page = event.page;
    this.pageSize = event.pageSize;

    this.loadEntities();
  }

  onTableAction(
    event: {
      actionId: string;
      row: Entity;
    }
  ): void {

    const { actionId, row } = event;

    if (actionId === 'edit') {
      this.router.navigate([
        `/entities/update/${row.id_entity}`,
      ]);
    }

    if (actionId === 'delete') {
      this.delete(row);
    }
  }

  delete(entity: Entity): void {

    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Eliminar la entidad "${entity.name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {

      if (result.isConfirmed) {

        this.entityService
          .delete(entity.id_entity!)
          .subscribe({
            next: () => {

              Swal.fire(
                'Eliminada',
                `La entidad "${entity.name}" fue eliminada.`,
                'success'
              );

              this.loadEntities();
            },
            error: (err: any) => {
              console.error(err);
            }
          });
      }
    });
  }
}