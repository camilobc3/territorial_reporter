// list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { EntitiesService } from 'src/app/services/entity.service';
import { Entity } from 'src/app/models/entity';
import { OptimizedTableComponent, OptimizedActionButton } from '../../../components/ui/optimized-table/optimized-table/optimized-table.component';
import { OptimizedColumnDef } from '../../../components/ui/optimized-table/optimized-table/optimized-column-def';
import { environment } from 'src/environments/environments';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-entities-list',
  standalone: true,
  imports: [
    MaterialModule,
    OptimizedTableComponent,
  ],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  entities: Entity[] = [];
  loading = false;

  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  // ---------- Configuración de tabla ----------

  columns: OptimizedColumnDef[] = [
    {
      key: 'logo_url',
      header: 'Logo',
      type: 'image',
      imageBaseUrl: environment.apiUrl + '/api/images/',
      imageFallbackIcon: 'business',
    },
    {
      key: 'name',
      header: 'Nombre',
    },
    {
      key: 'address',
      header: 'Dirección',
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Estado',
      type: 'badge',
      badgeOptions: [
        { value: 'active',   label: 'Activa',   class: 'bg-light-success text-success' },
        { value: 'inactive', label: 'Inactiva', class: 'bg-light-error text-error'     },
      ],
    },
  ];

  actions: OptimizedActionButton[] = [
    { id: 'edit',   icon: 'edit',   tooltip: 'Editar',   iconClass: 'text-primary' },
    { id: 'delete', icon: 'delete', tooltip: 'Eliminar', iconClass: 'text-error'   },
  ];

  constructor(
    private entitiesService: EntitiesService,
    private router: Router
  ) {}

  ngOnInit() {
    this.load();
  }

  // ---------- Carga ----------

  load() {
    this.loading = true;
    this.entitiesService.getPaged(this.page, this.pageSize).subscribe({
      next: (resp) => {
        this.entities   = resp.data ?? [];
        this.page       = resp.page ?? this.page;
        this.total      = resp.totalItems ?? this.entities.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading    = false;
      },
      error: (err) => {
        console.error(err);
        this.entities = [];
        this.loading  = false;
      },
    });
  }

  // ---------- Paginación ----------

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  // ---------- Navegación ----------

  openCreate() {
    this.router.navigate(['/entities/create']);
  }

  // ---------- Acciones de tabla ----------

  onAction(event: { actionId: string; row: Entity }) {
    if (event.actionId === 'edit')   this.router.navigate([`/entities/update/${event.row.id_entity}`]);
    if (event.actionId === 'delete') this.confirmDelete(event.row);
  }

  // ---------- CRUD ----------

  confirmDelete(entity: Entity) {
    Swal.fire({
      title: '¿Eliminar entidad?',
      text: `Se eliminará "${entity.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.entitiesService.delete(entity.id_entity!).subscribe({
          next: () => {
            this.load();
            Swal.fire('Eliminada', `La entidad "${entity.name}" fue eliminada.`, 'success');
          },
          error: (err) => {
            const msg = err?.error?.message ?? 'No se pudo eliminar la entidad.';
            Swal.fire('Error', msg, 'error');
          },
        });
      }
    });
  }
}