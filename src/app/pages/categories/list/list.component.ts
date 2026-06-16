import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Category } from 'src/app/models/category';
import { CategoriesService } from 'src/app/services/categories.service';
import { SidePanelUtils } from 'src/app/components/ui/side-panel/side-panel.utils';
import { HierarchicalTableComponent } from 'src/app/components/ui/hierarchical-table/hierarchical-table.component';
import { HierarchicalActionButton, HierarchicalColumnDef } from 'src/app/components/ui/hierarchical-table/hierarchical-table.types';
import { CategoryFormComponent } from '../components/category-form/category-form.component';
import { SidePanelComponent } from 'src/app/components/ui/side-panel/side-panel.component';
import { environment } from 'src/environments/environments';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [CommonModule, HierarchicalTableComponent, CategoryFormComponent, SidePanelComponent],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  categories: Category[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  editingCategory: Category | null = null;

  columns: HierarchicalColumnDef[] = [
    { key: 'image_url', header: 'Imagen', type: 'image',
      imageBaseUrl: environment.apiUrl, imageFallbackIcon: 'category' },
    { key: 'name',        header: 'Nombre' },
    { key: 'description', header: 'Descripción', hideOnMobile: true },
    {
      key: 'status', header: 'Estado', type: 'badge',
      badgeOptions: [
        { value: 'active',   label: 'Activa',   class: 'bg-green-100 text-green-700' },
        { value: 'inactive', label: 'Inactiva', class: 'bg-gray-100 text-gray-500'  },
      ],
    },
  ];

  actions: HierarchicalActionButton[] = [
    { id: 'edit',   icon: 'edit',   tooltip: 'Editar',   iconClass: 'text-yellow-500' },
    { id: 'delete', icon: 'delete', tooltip: 'Eliminar', iconClass: 'text-red-500'    },
  ];

  constructor(
    private categoriesService: CategoriesService,
    private cdr: ChangeDetectorRef,
    public panel: SidePanelUtils        // ← único cambio respecto al original
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.categoriesService.getAll().subscribe({
      next: (items: Category[]) => {
        this.categories = [...items];
        this.total = items.length;
        this.totalPages = 1;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.categories = [];
        this.total = 0;
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onTableAction(event: { actionId: string; row: Category }): void {
    const { actionId, row } = event;
    if (actionId === 'edit') {
      this.editingCategory = row;
      this.panel.open('Editar categoría', 'edit');
    } else if (actionId === 'delete') {
      this.confirmDelete(row);
    }
  }

  onFormSubmit(event: { data: Partial<Category>; image?: File }): void {
    const formData = new FormData();
    Object.entries(event.data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, String(v));
    });
    if (event.image) formData.append('file', event.image);

    const isCreate = this.panel.mode === 'create';
    const request$ = isCreate
      ? this.categoriesService.create(formData as any)
      : this.categoriesService.update(this.editingCategory!.id_category!, formData as any);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: isCreate ? 'Categoría creada' : 'Categoría actualizada',
          text: `La categoría "${event.data.name}" se ${isCreate ? 'creó' : 'actualizó'} correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.panel.close();
        this.editingCategory = null;
        this.loadCategories();
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `No se pudo ${isCreate ? 'crear' : 'actualizar'} la categoría.`,
        });
      },
    });
  }

  confirmDelete(category: Category): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar "${category.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) this.deleteCategory(category);
    });
  }

  private deleteCategory(category: Category): void {
    this.categoriesService.delete(category.id_category!).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success', title: 'Eliminada',
          text: `La categoría "${category.name}" fue eliminada.`,
          timer: 2000, showConfirmButton: false,
        });
        this.loadCategories();
      },
      error: (err) => {
        const msg = err?.error?.message
          ?? 'No se puede eliminar. Verifica que no tenga subcategorías ni anotaciones asociadas.';
        Swal.fire({ icon: 'error', title: 'No se puede eliminar', text: msg });
      },
    });
  }
}
