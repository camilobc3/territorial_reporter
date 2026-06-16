import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { OptimizedTableComponent, OptimizedActionButton } from 'src/app/components/ui/optimized-table/optimized-table/optimized-table.component';
import { OptimizedColumnDef } from 'src/app/components/ui/optimized-table/optimized-table/optimized-column-def';
import { Commune } from 'src/app/models/commune';
import { Neighborhood } from 'src/app/models/neighborhood';
import { CommunesService } from 'src/app/services/communes.service';
import { NeighborhoodsService } from 'src/app/services/neighborhoods.service';
import { PolygonStateService } from '../../../../services/api/leaflet/polygon-state.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-neighborhood-selector',
  standalone: true,
  imports: [CommonModule, MaterialModule, OptimizedTableComponent],
  templateUrl: './neighborhood-selector.component.html',
})
export class NeighborhoodSelectorComponent implements OnInit {

  @Output() neighborhoodSelected = new EventEmitter<Neighborhood>();

  communes:       Commune[]      = [];
  neighborhoods:  Neighborhood[] = [];
  loadingCommunes = false;
  loading         = false;

  columns: OptimizedColumnDef[] = [
    { key: 'name', header: 'Barrio' },
    {
      key: 'status', header: 'Estado', type: 'badge',
      badgeOptions: [
        { value: 'active',   label: 'Activo',   class: 'bg-light-success text-success' },
        { value: 'inactive', label: 'Inactivo', class: 'bg-light-error text-error'     },
      ],
    },
  ];

  actions: OptimizedActionButton[] = [
    { id: 'select', icon: 'map', tooltip: 'Demarcar', iconClass: 'text-primary' },
  ];

  constructor(
    private communesService:      CommunesService,
    private neighborhoodsService: NeighborhoodsService,
    private polygonState:         PolygonStateService,
  ) {}

  ngOnInit(): void {
    this.loadCommunes();
  }

  loadCommunes(): void {
    this.loadingCommunes = true;
    this.communesService.getAll().subscribe({
      next: (communes) => {
        this.communes        = communes.sort((a, b) => a.name.localeCompare(b.name));
        this.loadingCommunes = false;
      },
      error: () => { this.loadingCommunes = false; }
    });
  }

  onCommuneChange(idCommune: number): void {
    if (!idCommune) return;
    this.loading = true;
    this.neighborhoodsService.getByCommune(idCommune).subscribe({
      next: (items: any) => {
        const list = Array.isArray(items) ? items : (items.items ?? items.data ?? []);
        this.neighborhoods = list;
        this.loading       = false;
      },
      error: () => {
        this.neighborhoods = [];
        this.loading       = false;
      },
    });
  }

  onAction(event: { actionId: string; row: Neighborhood }): void {
    if (event.actionId !== 'select') return;

    if (this.polygonState.hasChanges) {
      Swal.fire({
        title:             '¿Cambiar de barrio?',
        text:              'Tienes cambios sin guardar. Si continúas los perderás.',
        icon:              'warning',
        showCancelButton:  true,
        confirmButtonText: 'Sí, cambiar',
        cancelButtonText:  'Cancelar',
      }).then(r => {
        if (r.isConfirmed) {
          this.polygonState.reset();
          this.neighborhoodSelected.emit(event.row);
        }
      });
      return;
    }

    this.neighborhoodSelected.emit(event.row);
  }
}