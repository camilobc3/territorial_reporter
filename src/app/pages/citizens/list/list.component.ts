// list.component.ts - Citizen
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CitizenService } from 'src/app/services/citizen.service';
import { Citizen } from 'src/app/models/citizen';
import { RichTableComponent, RichActionButton } from '../../../components/ui/rich-table/rich-table/rich-table.component';
import { RichColumnDef } from '../../../components/ui/rich-table/rich-table/rich-column-def';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-citizen-list',
  standalone: true,
  imports: [RichTableComponent],
  templateUrl: './list.component.html',
})
export class CitizenListComponent implements OnInit {

  citizens: Citizen[] = [];
  loading = false;

  page = 1;
  pageSize = 5;
  total = 0;
  totalPages = 1;

  panelOpen = false;
  selectedCitizen: Citizen | null = null;

  // ---------- Configuración de tabla ----------

  columns: RichColumnDef[] = [
    { key: 'id_citizen', header: 'ID'        },
    { key: 'name',       header: 'Nombre'    },
    { key: 'email',      header: 'Email',      hideOnMobile: true },
    { key: 'phone',      header: 'Teléfono',   hideOnMobile: true },
    {
      key: 'status',
      header: 'Estado',
      type: 'badge',
      badgeOptions: [
        { value: 'active',   label: 'Activo',   class: 'bg-light-success text-success' },
        { value: 'inactive', label: 'Inactivo', class: 'bg-light-error text-error'     },
      ],
    },
  ];

  actions: RichActionButton[] = [
    { id: 'edit',   icon: 'edit',   tooltip: 'Editar',   iconClass: 'text-primary' },
    { id: 'delete', icon: 'delete', tooltip: 'Eliminar', iconClass: 'text-error'   },
  ];

  constructor(
    private citizenService: CitizenService,
    private router: Router
  ) {}

  // ---------- Navegación ----------

  openCreate(): void {
    this.router.navigate(['/citizens/create']);
  }

  ngOnInit(): void {
    this.load();
  }

  // ---------- Carga ----------

  load(page = this.page, pageSize = this.pageSize): void {
    this.loading = true;
    this.citizenService.getPaged(page, pageSize).subscribe({
      next: (resp) => {
        this.citizens   = resp.data       || [];
        this.page       = resp.page       || page;
        this.pageSize   = resp.pageSize   || pageSize;
        this.total      = resp.totalItems ?? this.citizens.length;
        this.totalPages = resp.totalPages ?? Math.max(1, Math.ceil(this.total / this.pageSize));
        this.loading    = false;
      },
      error: () => {
        this.citizens   = [];
        this.total      = 0;
        this.totalPages = 1;
        this.loading    = false;
      },
    });
  }

  // ---------- Paginación ----------

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.load();
  }

  // ---------- Acciones de tabla ----------

  onAction(event: { actionId: string; row: Citizen }): void {
    if (event.actionId === 'edit')   this.router.navigate([`/citizens/update/${event.row.id_citizen}`]);
    if (event.actionId === 'delete') this.delete(event.row);
  }

  // ---------- CRUD ----------

  delete(citizen: Citizen): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Quieres eliminar al ciudadano "${citizen.name}"? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.citizenService.delete(citizen.id_citizen!).subscribe({
          next: () => {
            Swal.fire('Eliminado', `El ciudadano "${citizen.name}" ha sido eliminado.`, 'success');
            this.load();
          },
        });
      }
    });
  }
}