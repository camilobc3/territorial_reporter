import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Commune } from 'src/app/models/commune';
import { Department } from 'src/app/models/department';
import { City } from 'src/app/models/city';
import { CommunesService } from 'src/app/services/communes.service';
import { DepartmentService } from 'src/app/services/department.service';
import { CityService } from 'src/app/services/city.service';
import { SidePanelUtils } from 'src/app/components/ui/side-panel/side-panel.utils';
import { SidePanelComponent } from 'src/app/components/ui/side-panel/side-panel.component';
import { OptimizedTableComponent, OptimizedActionButton } from 'src/app/components/ui/optimized-table/optimized-table/optimized-table.component';
import { OptimizedColumnDef } from 'src/app/components/ui/optimized-table/optimized-table/optimized-column-def';
import { CommuneFormComponent } from '../components/commune-form/commune-form.component';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface ColombiaCity       { id: number; name: string; }
interface ColombiaDepartment { id: number; name: string; }

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    OptimizedTableComponent,
    SidePanelComponent,
    CommuneFormComponent,
  ],
  templateUrl: './list.component.html',
})
export class ListComponent implements OnInit {

  // ── Datos de la tabla ──────────────────────────────────────────────────────
  communes: Commune[] = [];
  loading = false;
  page = 1;
  pageSize = 10;
  total = 0;
  totalPages = 1;

  // ── Filtros ────────────────────────────────────────────────────────────────
  filterForm!: FormGroup;

  /** Listas de la API Colombia */
  colombiaDepartments: ColombiaDepartment[] = [];
  colombiaCities: ColombiaCity[] = [];
  loadingDepts = false;
  loadingCities = false;

  /** Ciudad seleccionada actualmente (para pasarla al form) */
  selectedCityId: number | null = null;

  // ── Panel ──────────────────────────────────────────────────────────────────
  editingCommune: Commune | null = null;

  // ── Configuración tabla ────────────────────────────────────────────────────
  columns: OptimizedColumnDef[] = [
    { key: 'name',   header: 'Nombre' },
    {
      key: 'status', header: 'Estado', type: 'badge',
      badgeOptions: [
        { value: 'active',   label: 'Activa',   class: 'bg-light-success text-success' },
        { value: 'inactive', label: 'Inactiva', class: 'bg-light-error text-error'     },
      ],
    },
    { key: 'created_at', header: 'Creada', type: 'date', hideOnMobile: true },
  ];

  actions: OptimizedActionButton[] = [
    { id: 'edit',   icon: 'edit',   tooltip: 'Editar',   iconClass: 'text-primary' },
    { id: 'delete', icon: 'delete', tooltip: 'Eliminar', iconClass: 'text-error'   },
  ];

  private readonly COLOMBIA_API = 'https://api-colombia.com/api/v1';

  constructor(
    private communesService: CommunesService,
    private departmentService: DepartmentService,
    private cityService: CityService,
    private http: HttpClient,
    private fb: FormBuilder,
    public panel: SidePanelUtils,
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      department: [null, Validators.required],
      city:       [{ value: null, disabled: true }, Validators.required],
    });

    this.loadColombiaDepartments();
  }

  // ── API Colombia ───────────────────────────────────────────────────────────

  loadColombiaDepartments(): void {
    this.loadingDepts = true;
    this.http.get<ColombiaDepartment[]>(`${this.COLOMBIA_API}/Department`).subscribe({
      next: (depts) => {
        this.colombiaDepartments = depts.sort((a, b) => a.name.localeCompare(b.name));
        this.loadingDepts = false;
      },
      error: () => { this.loadingDepts = false; }
    });
  }

  onDepartmentChange(colombiaId: number): void {
    // Limpiar ciudad y tabla
    this.filterForm.get('city')!.reset();
    this.filterForm.get('city')!.disable();
    this.colombiaCities = [];
    this.communes = [];
    this.selectedCityId = null;

    if (!colombiaId) return;

    this.loadingCities = true;
    this.http.get<ColombiaCity[]>(`${this.COLOMBIA_API}/Department/${colombiaId}/cities`).subscribe({
      next: (cities) => {
        this.colombiaCities = cities.sort((a, b) => a.name.localeCompare(b.name));
        this.filterForm.get('city')!.enable();
        this.loadingCities = false;
      },
      error: () => { this.loadingCities = false; }
    });
  }

  onCityChange(colombiaCityId: number): void {
    if (!colombiaCityId) return;

    // Buscar la ciudad en nuestro backend por nombre
    // (la API Colombia usa su propio ID, nuestro backend usa id_city propio)
    const colombiaCity = this.colombiaCities.find(c => c.id === colombiaCityId);
    if (!colombiaCity) return;

    // Buscar en nuestro backend la ciudad que coincide con ese nombre
    this.cityService.getAll().subscribe({
      next: (cities) => {
        const match = cities.find(c =>
          c.name.toLowerCase().trim() === colombiaCity.name.toLowerCase().trim()
        );
        if (match?.id_city) {
          this.selectedCityId = match.id_city;
          this.loadCommunes(match.id_city);
        } else {
          // La ciudad existe en API Colombia pero no en nuestro backend aún
          this.communes = [];
          this.total = 0;
          Swal.fire({
            icon: 'info',
            title: 'Ciudad no registrada',
            text: `La ciudad "${colombiaCity.name}" aún no está registrada en el sistema.`,
          });
        }
      }
    });
  }

  // ── Carga de comunas ───────────────────────────────────────────────────────

  loadCommunes(idCity: number, page = this.page): void {
    this.loading = true;
    this.communesService.getByCity(idCity).subscribe({
      next: (items: any) => {
        // Soporta respuesta plana o paginada
        const list = Array.isArray(items) ? items : (items.items ?? items.data ?? []);
        this.communes   = list;
        this.total      = list.length;
        this.totalPages = 1;
        this.loading    = false;
      },
      error: () => {
        this.communes = [];
        this.loading  = false;
      }
    });
  }

  goToPage(p: number): void {
    if (!this.selectedCityId) return;
    this.page = p;
    this.loadCommunes(this.selectedCityId, p);
  }

  // ── Acciones de tabla ──────────────────────────────────────────────────────

  onAction(event: { actionId: string; row: Commune }): void {
    if (event.actionId === 'edit') {
      this.editingCommune = event.row;
      this.panel.open('Editar comuna', 'edit');
    }
    if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  openCreate(): void {
    if (!this.selectedCityId) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona una ciudad',
        text: 'Debes seleccionar un departamento y una ciudad antes de crear una comuna.',
      });
      return;
    }
    this.editingCommune = null;
    this.panel.open('Nueva comuna', 'create');
  }

  // ── Submit ─────────────────────────────────────────────────────────────────

  onFormSubmit(data: Partial<Commune>): void {
    const isCreate = this.panel.mode === 'create';
    const request$ = isCreate
      ? this.communesService.create(data as Omit<Commune, 'id_commune'>)
      : this.communesService.update(this.editingCommune!.id_commune!, data as Commune);

    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: isCreate ? 'Comuna creada' : 'Comuna actualizada',
          text: `La comuna "${data.name}" se ${isCreate ? 'creó' : 'actualizó'} correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.panel.close();
        this.editingCommune = null;
        if (this.selectedCityId) this.loadCommunes(this.selectedCityId);
      },
      error: (err) => {
        const msg = err?.error?.message ?? `No se pudo ${isCreate ? 'crear' : 'actualizar'} la comuna.`;
        Swal.fire({ icon: 'error', title: 'Error', text: msg });
      }
    });
  }

  onFormCancel(): void {
    this.panel.close();
    this.editingCommune = null;
  }

  // ── Eliminar ───────────────────────────────────────────────────────────────

  confirmDelete(commune: Commune): void {
    Swal.fire({
      title: '¿Eliminar comuna?',
      text: `Se eliminará "${commune.name}". Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then(result => {
      if (result.isConfirmed) this.delete(commune);
    });
  }

  private delete(commune: Commune): void {
    this.communesService.delete(commune.id_commune!).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success', title: 'Eliminada',
          text: `La comuna "${commune.name}" fue eliminada.`,
          timer: 2000, showConfirmButton: false,
        });
        if (this.selectedCityId) this.loadCommunes(this.selectedCityId);
      },
      error: (err) => {
        const msg = err?.error?.message
          ?? 'No se puede eliminar. Verifica que la comuna no tenga barrios asociados.';
        Swal.fire({ icon: 'error', title: 'No se puede eliminar', text: msg });
      }
    });
  }
}