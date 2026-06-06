// list.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { EntitiesService } from 'src/app/services/entity.service';
import { Entity } from 'src/app/models/entity';
import { FormComponent } from '../components/form/form.component';
import { environment } from 'src/environments/environments';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-entities-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    NgScrollbarModule,
    FormComponent,
  ],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {
  @ViewChild('entityFormRef') entityFormRef?: FormComponent;

  entities: Entity[] = [];
  loading = false;
  searchText = '';

  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  panelOpen = false;
  selectedEntity: Entity | null = null;

  readonly apiBase = environment.apiUrl;

  constructor(private entitiesService: EntitiesService) {}

  ngOnInit() {
    this.load();
  }

  // ---------- Carga ----------

  load() {
  this.loading = true;

  this.entitiesService.getPaged(this.page, this.pageSize).subscribe({
    next: (resp) => {

      console.log('RESPUESTA COMPLETA:', resp);
      console.log('RESP.DATA:', resp.data);

      this.entities = resp.data ?? [];

      console.log('ENTITIES:', this.entities);

      this.page = resp.page ?? this.page;
      this.total = resp.totalItems ?? this.entities.length;
      this.totalPages =
        resp.totalPages ??
        Math.max(1, Math.ceil(this.total / this.pageSize));

      this.loading = false;
    },
    error: (err) => {
      console.error(err);
      this.entities = [];
      this.loading = false;
    }
  });
}
  // ---------- Filtro local ----------

  get filteredEntities(): Entity[] {
    if (!this.searchText.trim()) return this.entities;
    const q = this.searchText.toLowerCase();
    return this.entities.filter((e) =>
      (e.name ?? '').toLowerCase().includes(q)
    );
  }

  // ---------- Paginación ----------

  goToPage(p: number) {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  get pages(): number[] {
    const range: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) range.push(i);
    return range;
  }

  get fromItem(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get toItem(): number {
    return Math.min(this.page * this.pageSize, this.total);
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

  onImgError(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}