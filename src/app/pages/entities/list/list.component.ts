// list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { EntitiesService } from 'src/app/services/entity.service';
import { Entity } from 'src/app/models/entity';
import { FormComponent } from '../components/form/form.component';
import { environment } from 'src/environments/environments';
import { RichTableComponent, RichActionButton } from '../../../components/ui/rich-table/rich-table/rich-table.component';
import Swal from 'sweetalert2';
import { RichColumnDef } from 'src/app/components/ui/rich-table/rich-table/rich-column-def';

@Component({
  selector: 'app-entities-list',
  standalone: true,
  imports: [
    MaterialModule,
    FormComponent,
    RichTableComponent,
  ],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  @ViewChild('entityFormRef') entityFormRef?: FormComponent;

  entities: Entity[] = [];
  loading = false;

  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  panelOpen = false;
  selectedEntity: Entity | null = null;

  // ---------- Configuración de tabla ----------

  columns: RichColumnDef[] = [
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

  actions: RichActionButton[] = [
    { id: 'edit',   icon: 'edit',   tooltip: 'Editar',   iconClass: 'text-primary' },
    { id: 'delete', icon: 'delete', tooltip: 'Eliminar', iconClass: 'text-error'   },
  ];

  constructor(private entitiesService: EntitiesService) {}

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

  // ---------- Acciones de tabla ----------

  onAction(event: { actionId: string; row: Entity }) {
    if (event.actionId === 'edit')   this.openEdit(event.row);
    if (event.actionId === 'delete') this.confirmDelete(event.row);
  }

  // ---------- Panel ----------

  openCreate() {
    this.selectedEntity = null;
    this.panelOpen = true;
  }

  openEdit(entity: Entity) {
    this.selectedEntity = { ...entity };
    this.panelOpen = true;
  }

  closePanel() {
    this.panelOpen = false;
    this.selectedEntity = null;
  }

  // ---------- CRUD ----------

  onFormSubmit(fd: FormData) {
    const isEdit = !!this.selectedEntity?.id_entity;
    const request$ = isEdit
      ? this.entitiesService.update(this.selectedEntity!.id_entity!, fd)
      : this.entitiesService.create(fd);

    request$.subscribe({
      next: () => {
        this.entityFormRef?.stopSubmitting();
        this.closePanel();
        this.load();
        Swal.fire({
          toast: true,
          position: 'bottom-start',
          icon: 'success',
          title: isEdit ? 'Entidad actualizada correctamente.' : 'La entidad se creó correctamente.',
          showConfirmButton: false,
          timer: 3000,
        });
      },
      error: (err) => {
        this.entityFormRef?.stopSubmitting();
        const msg: string = err?.error?.message ?? 'Error al guardar la entidad.';
        const icon = msg.toLowerCase().includes('nombre') || msg.toLowerCase().includes('email')
          ? 'warning'
          : 'error';
        Swal.fire({
          toast: true,
          position: 'bottom-start',
          icon,
          title: msg,
          showConfirmButton: false,
          timer: 4000,
        });
      },
    });
  }

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