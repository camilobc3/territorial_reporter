import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Neighborhood } from 'src/app/models/neighborhood';
import { Commune } from 'src/app/models/commune';
import { NeighborhoodsService } from 'src/app/services/neighborhoods.service';
import { CommunesService } from 'src/app/services/communes.service';
import { SidePanelUtils } from 'src/app/components/ui/side-panel/side-panel.utils';
import { SidePanelComponent } from 'src/app/components/ui/side-panel/side-panel.component';
import { OptimizedTableComponent, OptimizedActionButton } from 'src/app/components/ui/optimized-table/optimized-table/optimized-table.component';
import { OptimizedColumnDef } from 'src/app/components/ui/optimized-table/optimized-table/optimized-column-def';
import { NeighborhoodFormComponent } from '../components/neighborhood-form/neighborhood-form.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    OptimizedTableComponent,
    SidePanelComponent,
    NeighborhoodFormComponent,
  ],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  // ── Datos de la tabla ──────────────────────────────────────────────────────
  neighborhoods: Neighborhood[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  // ── Filtros ────────────────────────────────────────────────────────────────
  filterForm!: FormGroup;

  communes: Commune[] = [];
  loadingCommunes = false;

  selectedCommuneId: number | null = null;

  // ── Panel ──────────────────────────────────────────────────────────────────
  editingNeighborhood: Neighborhood | null = null;

  // ── Configuración tabla ────────────────────────────────────────────────────
  columns: OptimizedColumnDef[] = [
    { key: 'name', header: 'Nombre' },
    {
      key: 'status', header: 'Estado', type: 'badge',
      badgeOptions: [
        { value: 'active',   label: 'Activo',   class: 'bg-light-success text-success' },
        { value: 'inactive', label: 'Inactivo', class: 'bg-light-error text-error'     },
      ],
    },
    { key: 'created_at', header: 'Creado', type: 'date', hideOnMobile: true },
  ];

  actions: OptimizedActionButton[] = [
    { id: 'edit',   icon: 'edit',   tooltip: 'Editar',   iconClass: 'text-primary' },
    { id: 'delete', icon: 'delete', tooltip: 'Eliminar', iconClass: 'text-error'   },
  ];

  constructor(
    private neighborhoodsService: NeighborhoodsService,
    private communesService: CommunesService,
    private fb: FormBuilder,
    public panel: SidePanelUtils,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      commune: [null, Validators.required],
    });

    this.loadCommunes();
  }

  // ── Cargar comunas del backend ─────────────────────────────────────────────

  loadCommunes(): void {
    this.loadingCommunes = true;
    this.communesService.getAll().subscribe({
      next: (communes) => {
        this.communes = communes.sort((a, b) => a.name.localeCompare(b.name));
        this.loadingCommunes = false;
      },
      error: () => { this.loadingCommunes = false; }
    });
  }

  // ── Al seleccionar comuna → cargar barrios ─────────────────────────────────

  onCommuneChange(idCommune: number): void {
    if (!idCommune) return;
    this.selectedCommuneId = idCommune;
    this.loadNeighborhoods(idCommune);
  }

  // ── Carga de barrios ───────────────────────────────────────────────────────

  loadNeighborhoods(idCommune: number, page = this.page): void {
    this.loading = true;
    this.neighborhoodsService.getByCommune(idCommune).subscribe({
      next: (items: any) => {
        const list = Array.isArray(items) ? items : (items.items ?? items.data ?? []);
        this.neighborhoods = list;
        this.total         = list.length;
        this.totalPages    = 1;
        this.loading       = false;
      },
      error: () => {
        this.neighborhoods = [];
        this.loading       = false;
      }
    });
  }

  goToPage(p: number): void {
    if (!this.selectedCommuneId) return;
    this.page = p;
    this.loadNeighborhoods(this.selectedCommuneId, p);
  }

  // ── Acciones de tabla ──────────────────────────────────────────────────────

  onAction(event: { actionId: string; row: Neighborhood }): void {
    if (event.actionId === 'edit') {
      this.editingNeighborhood = event.row;
      this.panel.open('Editar barrio', 'edit');
    }
    if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  openCreate(): void {
    if (!this.selectedCommuneId) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona una comuna',
        text: 'Debes seleccionar una comuna antes de crear un barrio.',
      });
      return;
    }
    this.editingNeighborhood = null;
    this.panel.open('Nuevo barrio', 'create');
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onFormSubmit(data: Partial<Neighborhood>): void {
    // Garantizar que id_commune siempre esté presente
    if (!data.id_commune && this.selectedCommuneId) {
      data.id_commune = this.selectedCommuneId;
    }

    const isCreate = this.panel.mode === 'create';
    const request$ = isCreate
      ? this.neighborhoodsService.create(data as Omit<Neighborhood, 'id_neighborhood'>)
      : this.neighborhoodsService.update(this.editingNeighborhood!.id_neighborhood!, data as Neighborhood);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: isCreate ? 'Barrio creado' : 'Barrio actualizado',
          text: `El barrio "${data.name}" se ${isCreate ? 'creó' : 'actualizó'} correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.panel.close();
        this.editingNeighborhood = null;
        if (this.selectedCommuneId) this.loadNeighborhoods(this.selectedCommuneId);
      },
      error: (err) => {
        const msg = err?.error?.message ?? `No se pudo ${isCreate ? 'crear' : 'actualizar'} el barrio.`;
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    });
  }

  onFormCancel(): void {
    this.panel.close();
    this.editingNeighborhood = null;
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────

  confirmDelete(neighborhood: Neighborhood): void {
    Swal.fire({
      title: '¿Eliminar barrio?',
      text: `Se eliminará "${neighborhood.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) this.delete(neighborhood);
    });
  }

  private delete(neighborhood: Neighborhood): void {
    this.neighborhoodsService.delete(neighborhood.id_neighborhood!).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success', title: 'Eliminado',
          text: `El barrio "${neighborhood.name}" fue eliminado.`,
          timer: 2000, showConfirmButton: false,
        });
        if (this.selectedCommuneId) this.loadNeighborhoods(this.selectedCommuneId);
      },
      error: (err) => {
        const msg = err?.error?.message
          ?? 'No se puede eliminar. Verifica que el barrio no tenga puntos ni anotaciones asociadas.';
        Swal.fire({ icon: 'error', title: 'No se puede eliminar', text: msg });
      }
    });
  }
}