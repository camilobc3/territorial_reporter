import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Official } from 'src/app/models/official';
import { OfficialsService } from 'src/app/services/officials.service';
import { OptimizedTableComponent, OptimizedActionButton } from '../../../components/ui/optimized-table/optimized-table/optimized-table.component';
import { OptimizedColumnDef } from '../../../components/ui/optimized-table/optimized-table/optimized-column-def';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [OptimizedTableComponent],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent implements OnInit {

  officials: Official[] = [];
  loading = false;

  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;
  selectedEntityId: number | null = null;

  columns: OptimizedColumnDef[] = [
    { key: 'name',   header: 'Funcionario' },
    { key: 'role',   header: 'Cargo/Rol' },
    { key: 'email',  header: 'Correo', hideOnMobile: true },
    { key: 'phone',  header: 'Celular', hideOnMobile: true },
    {
      key: 'status',
      header: 'Estado',
      type: 'badge',
      badgeOptions: [
        { value: 'active',   label: 'Activo',   class: 'bg-light-success text-success' },
        { value: 'inactive', label: 'Inactivo', class: 'bg-light-error text-error' },
      ],
    },
  ];

  actions: OptimizedActionButton[] = [
    { id: 'edit',   icon: 'edit',   tooltip: 'Editar',   iconClass: 'text-primary' },
    { id: 'delete', icon: 'delete', tooltip: 'Eliminar', iconClass: 'text-error' },
  ];

  constructor(
    private officialsService: OfficialsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  openCreate(): void {
    this.router.navigate(['/officials/create'], {
      queryParams: this.selectedEntityId !== null ? { id_entity: this.selectedEntityId } : undefined,
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const idEntityParam = params.get('id_entity');
      const idEntity = idEntityParam ? Number(idEntityParam) : NaN;
      this.selectedEntityId = Number.isNaN(idEntity) ? null : idEntity;
      this.page = 1;
      this.load();
    });
  }

  load(page = this.page, pageSize = this.pageSize): void {
    if (this.selectedEntityId !== null) {
      this.loadByEntity(this.selectedEntityId);
      return;
    }

    this.loading = true;
    this.officialsService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.officials  = resp.data || [];
        this.page       = resp.page || page;
        this.pageSize   = resp.pageSize || pageSize;
        this.total      = resp.totalItems ?? this.officials.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading    = false;
      },
      error: () => {
        this.officials  = [];
        this.total      = 0;
        this.totalPages = 1;
        this.loading    = false;
      },
    });
  }

  loadByEntity(idEntity: number): void {
    this.loading = true;
    this.officialsService.getByEntity(idEntity).subscribe({
      next: (officials) => {
        this.officials  = officials || [];
        this.page       = 1;
        this.pageSize   = this.officials.length || 5;
        this.total      = this.officials.length;
        this.totalPages = 1;
        this.loading    = false;
      },
      error: () => {
        this.officials  = [];
        this.page       = 1;
        this.pageSize   = 5;
        this.total      = 0;
        this.totalPages = 1;
        this.loading    = false;
      },
    });
  }

  goToPage(p: number): void {
    if (this.selectedEntityId !== null) return;
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  onAction(event: { actionId: string; row: Official }): void {
    if (event.actionId === 'edit') this.router.navigate([`/officials/update/${event.row.id_official}`]);
    if (event.actionId === 'delete') this.delete(event.row);
  }

  delete(official: Official): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar al funcionario "${official.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.officialsService.delete(official.id_official!).subscribe({
          next: () => {
            Swal.fire('Eliminado', `El funcionario "${official.name}" ha sido eliminado.`, 'success');
            this.load();
          },
        });
      }
    });
  }

}
