import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { Category } from 'src/app/models/category';
import { CategoriesService } from 'src/app/services/categories.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  categories: Category[] = [];
  loading = false;

  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  // ── Búsqueda ──────────────────────────────────────────────────────────────
  searchTerm = '';

  get filteredCategories(): Category[] {
    if (!this.searchTerm.trim()) return this.categories;
    const term = this.searchTerm.toLowerCase();
    return this.categories.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
    );
  }

  // ── Columnas y acciones (listas para DynamicTable) ────────────────────────
  // TODO: descomentar cuando DynamicTable esté disponible
  // columns: ColumnDef[] = [
  //   { header: 'ID',          key: 'id_category' },
  //   { header: 'Nombre',      key: 'name' },
  //   { header: 'Descripción', key: 'description' },
  //   { header: 'Tipo',        key: 'id_parent_category',
  //     transform: (v) => v ? 'Subcategoría' : 'Categoría' },
  //   { header: 'Estado',      key: 'status' },
  // ];

  // actions: ActionButton[] = [
  //   { id: 'edit',   label: 'Editar',   icon: 'heroPencil',
  //     class: 'flex-1 px-2 py-1 rounded bg-yellow-400 text-black cursor-pointer flex items-center justify-center gap-1' },
  //   { id: 'delete', label: 'Eliminar', icon: 'heroTrash',
  //     class: 'flex-1 px-2 py-1 rounded bg-red-500 text-white cursor-pointer flex items-center justify-center gap-1' },
  // ];

  constructor(
    private categoriesService: CategoriesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.categoriesService.getPaged(page, pageSize).subscribe({
      next: (resp: any) => {
        this.categories = resp.items ?? resp.data ?? [];
        this.page = resp.page ?? page;
        this.pageSize = resp.pageSize ?? pageSize;
        this.total = resp.totalItems ?? this.categories.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading = false;
      },
      error: () => {
        this.categories = [];
        this.total = 0;
        this.totalPages = 1;
        this.loading = false;
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/categories/create']);
  }

  goToEdit(category: Category): void {
    this.router.navigate([`/categories/update/${category.id_category}`]);
  }

  confirmDelete(category: Category): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.delete(category);
      }
    });
  }

  private delete(category: Category): void {
    this.categoriesService.delete(category.id_category!).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Eliminada',
          text: `La categoría "${category.name}" fue eliminada.`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.loadCategories();
      },
      error: (err) => {
        // El backend devuelve 409 cuando tiene dependencias (CU-04 E2/E2a)
        const msg = err?.error?.message
          ?? 'No se puede eliminar. Verifica que no tenga subcategorías ni anotaciones asociadas.';
        Swal.fire({ icon: 'error', title: 'No se puede eliminar', text: msg });
      }
    });
  }

  // ── Paginación manual (hasta que llegue DynamicTable) ─────────────────────
  prevPage(): void {
    if (this.page > 1) this.loadCategories(this.page - 1, this.pageSize);
  }

  nextPage(): void {
    if (this.page < this.totalPages) this.loadCategories(this.page + 1, this.pageSize);
  }

  // ── Acciones desde tabla (para enchufar DynamicTable después) ─────────────
  onTableAction(event: { actionId: string; row: Category }): void {
    const { actionId, row } = event;
    if (actionId === 'edit') {
      this.goToEdit(row);
    } else if (actionId === 'delete') {
      this.confirmDelete(row);
    }
  }
}