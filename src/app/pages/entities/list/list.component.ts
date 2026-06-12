import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { EntitiesService } from 'src/app/services/entity.service';
import { Entity } from 'src/app/models/entity';
import { OptimizedTableComponent, OptimizedActionButton } from 'src/app/components/ui/optimized-table/optimized-table/optimized-table.component';
import { OptimizedColumnDef } from 'src/app/components/ui/optimized-table/optimized-table/optimized-column-def';
import { SidePanelComponent } from 'src/app/components/ui/side-panel/side-panel.component';
import { SidePanelUtils } from 'src/app/components/ui/side-panel/side-panel.utils';
import { Router } from '@angular/router';
import { FormComponent } from '../components/form/form.component';
import { environment } from 'src/environments/environments';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-entities-list',
  standalone: true,
  imports: [
    MaterialModule,
    OptimizedTableComponent,
    SidePanelComponent,
    FormComponent,
  ],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  @ViewChild(FormComponent) formRef!: FormComponent;

  entities: Entity[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  editingEntity: Entity | undefined = undefined;

  columns: OptimizedColumnDef[] = [
    {
      key: 'logo_url',
      header: 'Logo',
      type: 'image',
      imageBaseUrl: environment.apiUrl + '/api/images/',
      imageFallbackIcon: 'business',
    },
    { key: 'name',    header: 'Nombre' },
    { key: 'address', header: 'Dirección', hideOnMobile: true },
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
    { id: 'officials', icon: 'groups', tooltip: 'Ver funcionarios', iconClass: 'text-secondary' },
    { id: 'edit',   icon: 'edit',   tooltip: 'Editar',   iconClass: 'text-primary' },
    { id: 'delete', icon: 'delete', tooltip: 'Eliminar', iconClass: 'text-error'   },
  ];

  constructor(
    private entitiesService: EntitiesService,
    public panel: SidePanelUtils,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  // ── Carga ──────────────────────────────────────────────────────────────────

  load(): void {
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

  // ── Paginación ─────────────────────────────────────────────────────────────

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  // ── Acciones de tabla ──────────────────────────────────────────────────────

  onAction(event: { actionId: string; row: Entity }): void {
    if (event.actionId === 'officials') {
      this.router.navigate(['/officials/list'], {
        queryParams: { id_entity: event.row.id_entity },
      });
    }
    if (event.actionId === 'edit') {
      this.editingEntity = event.row;
      this.panel.open('Editar entidad', 'edit');
    }
    if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  // ── Submit del formulario ──────────────────────────────────────────────────

  onFormSubmit(fd: FormData): void {
    const isCreate = this.panel.mode === 'create';
    const request$ = isCreate
      ? this.entitiesService.create(fd as any)
      : this.entitiesService.update(this.editingEntity!.id_entity!, fd as any);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: isCreate ? 'Entidad creada' : 'Entidad actualizada',
          text: `La entidad se ${isCreate ? 'creó' : 'actualizó'} correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.panel.close();
        this.editingEntity = undefined;
        this.load();
      },
      error: (err) => {
        this.formRef?.stopSubmitting();
        const msg = err?.error?.message ?? `No se pudo ${isCreate ? 'crear' : 'actualizar'} la entidad.`;
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      },
    });
  }

  onFormCancel(): void {
    this.panel.close();
    this.editingEntity = undefined;
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────

  confirmDelete(entity: Entity): void {
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
