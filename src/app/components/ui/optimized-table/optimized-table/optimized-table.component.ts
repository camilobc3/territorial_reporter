import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { BadgeOption, OptimizedColumnDef } from './optimized-column-def';

export interface OptimizedActionButton {
  id: string;
  icon: string;
  tooltip: string;
  /** Clases Tailwind para el color del ícono, ej: 'text-primary' */
  iconClass?: string;
}

@Component({
  selector: 'app-optimized-table',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './optimized-table.component.html',
})
export class OptimizedTableComponent<T extends Record<string, any>> {

  // --- Configuración visual ---
  @Input() title = '';
  @Input() subtitle = '';
  @Input() createLabel = 'Nuevo';
  @Input() searchPlaceholder = 'Buscar...';
  /** Clave del campo sobre el que se filtra en el buscador */
  @Input() searchKey = 'name';
  @Input() showCreateButton = true;

  // --- Definición de columnas y acciones ---
  @Input() columns: OptimizedColumnDef[] = [];
  @Input() actions: OptimizedActionButton[] = [];

  // --- Datos ---
  @Input() data: T[] = [];
  @Input() loading = false;

  // --- Paginación ---
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() totalPages = 1;

  // --- Eventos ---
  @Output() create = new EventEmitter<void>();
  @Output() action = new EventEmitter<{ actionId: string; row: T }>();
  @Output() pageChange = new EventEmitter<number>();

  searchText = '';

  // ─── Helpers de datos ───────────────────────────────────────────────────────

  get filteredData(): T[] {
    if (!this.searchText.trim()) return this.data;
    const q = this.searchText.toLowerCase();
    return this.data.filter((row) => {
      const val = this.getValue(row, this.searchKey);
      return String(val ?? '').toLowerCase().includes(q);
    });
  }

  getValue(row: T, key: string): any {
    if (!row || !key) return '';
    return key.split('.').reduce((acc: any, part) => acc?.[part] ?? '', row);
  }

  // ─── Helpers de paginación ───────────────────────────────────────────────────

  get fromItem(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1;
  }

  get toItem(): number {
    return Math.min(this.page * this.pageSize, this.total);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.pageChange.emit(p);
  }

  // ─── Helpers de renderizado ──────────────────────────────────────────────────

  getBadgeOption(col: OptimizedColumnDef, row: T): BadgeOption | null {
    const val = String(this.getValue(row, col.key) ?? '');
    return col.badgeOptions?.find((o) => o.value === val) ?? null;
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).classList.add('hidden');
  }
}
