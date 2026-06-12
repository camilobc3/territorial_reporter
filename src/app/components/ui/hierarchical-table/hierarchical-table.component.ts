import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  HierarchicalColumnDef,
  HierarchicalActionButton,
  HierarchicalActionEvent,
} from './hierarchical-table.types';
import {
  buildTree,
  flattenTree,
  setAllExpanded,
  TreeNode,
} from './hierarchical-table-tree.utils';

@Component({
  selector: 'app-hierarchical-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl:   './hierarchical-table.component.html',
})
export class HierarchicalTableComponent<T extends Record<string, any>>
  implements OnChanges {

  @Input() title = '';
  @Input() subtitle = '';
  @Input() createLabel = '';
  @Input() searchPlaceholder = 'Buscar…';
  @Input() emptyMessage = 'No hay registros.';
  @Input() columns: HierarchicalColumnDef[] = [];
  @Input() actions: HierarchicalActionButton[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() idKey = 'id';
  @Input() parentKey = 'id_parent';
  @Input() nameKey = 'name';
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() totalPages = 1;

  @Output() create = new EventEmitter<void>();
  @Output() action = new EventEmitter<HierarchicalActionEvent<T>>();
  @Output() pageChange = new EventEmitter<number>();

  protected searchQuery = '';
  protected visibleNodes: TreeNode<T>[] = [];
  protected skeletonRows = Array(5);
  protected readonly Math = Math;
  protected readonly String = String;

  private roots: TreeNode<T>[] = [];

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['idKey'] || changes['parentKey']) {
      this.roots = buildTree(this.data, this.idKey, this.parentKey);
      this.refresh();
    }
  }

  protected toggleNode(node: TreeNode<T>): void {
    node.expanded = !node.expanded;
    this.refresh();
  }

  protected expandAll(): void {
    setAllExpanded(this.roots, true);
    this.refresh();
  }

  protected collapseAll(): void {
    setAllExpanded(this.roots, false);
    this.refresh();
  }

  protected onSearch(): void {
    this.refresh();
  }

  protected changePage(p: number): void {
    if (p >= 1 && p <= this.totalPages) {
      this.pageChange.emit(p);
    }
  }

  protected get pageNumbers(): number[] {
    const delta = 2;
    const range: number[] = [];
    for (
      let i = Math.max(1, this.page - delta);
      i <= Math.min(this.totalPages, this.page + delta);
      i++
    ) {
      range.push(i);
    }
    return range;
  }

  protected getCellValue(row: T, key: string): any {
    return row[key];
  }

  protected badgeMatches(row: T, col: HierarchicalColumnDef): boolean {
    const val = String(this.getCellValue(row, col.key));
    return (col.badgeOptions ?? []).some(o => o.value === val);
  }

  protected getImageUrl(value: string, baseUrl?: string): string {
    if (!value) return '';
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    let base = baseUrl ?? '';
    if (base && !base.endsWith('/') && !value.startsWith('/')) base += '/';
    return base + value;
  }

  protected onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  protected trackByNode(_: number, node: TreeNode<T>): any {
    return node.data[this.idKey];
  }

  private refresh(): void {
    this.visibleNodes = flattenTree(this.roots, this.searchQuery);
    this.cdr.markForCheck();
  }
}