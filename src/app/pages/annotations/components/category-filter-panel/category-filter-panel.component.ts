import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MaterialModule } from 'src/app/material.module';
import { Category } from 'src/app/models/category';

export interface CategoryFilterNode {
  category: Category;
  count: number;
  children: CategoryFilterNode[];
}

@Component({
  selector: 'app-category-filter-panel',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule
  ],
  templateUrl: './category-filter-panel.component.html',
  styleUrl: './category-filter-panel.component.scss'
})
export class CategoryFilterPanelComponent {

  @Input() nodes: CategoryFilterNode[] = [];
  @Input() selectedIds: number[] = [];
  @Input() totalVisible = 0;

  @Output() selectedIdsChange = new EventEmitter<number[]>();
  @Output() clearFilters = new EventEmitter<void>();

  isSelected(idCategory: number | undefined): boolean {
    if (idCategory == null) return false;
    return this.selectedIds.includes(idCategory);
  }

  isNodeSelected(node: CategoryFilterNode): boolean {
    const ids = this.collectNodeIds(node);

    if (ids.length === 0) {
      return false;
    }

    return ids.every(id => this.selectedIds.includes(id));
  }

  isNodeIndeterminate(node: CategoryFilterNode): boolean {
    const ids = this.collectNodeIds(node);

    if (ids.length === 0) {
      return false;
    }

    const selectedCount = ids.filter(id => this.selectedIds.includes(id)).length;

    return selectedCount > 0 && selectedCount < ids.length;
  }

  toggleNode(node: CategoryFilterNode, checked: boolean): void {
    const ids = this.collectNodeIds(node);
    const selected = new Set(this.selectedIds);

    ids.forEach(id => {
      if (checked) {
        selected.add(id);
      } else {
        selected.delete(id);
      }
    });

    this.selectedIdsChange.emit(Array.from(selected));
  }

  toggleSingleCategory(idCategory: number | undefined, checked: boolean): void {
    if (idCategory == null) return;

    const selected = new Set(this.selectedIds);

    if (checked) {
      selected.add(idCategory);
    } else {
      selected.delete(idCategory);
    }

    this.selectedIdsChange.emit(Array.from(selected));
  }

  clear(): void {
    this.clearFilters.emit();
  }

  private collectNodeIds(node: CategoryFilterNode): number[] {
    const ids: number[] = [];

    if (node.category.id_category != null) {
      ids.push(node.category.id_category);
    }

    node.children.forEach(child => {
      ids.push(...this.collectNodeIds(child));
    });

    return ids;
  }
}