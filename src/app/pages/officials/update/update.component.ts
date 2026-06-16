import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Official } from 'src/app/models/official';
import { OfficialsService } from 'src/app/services/officials.service';
import { ComponentsComponent } from '../components/components.component';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [ComponentsComponent],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  official: Official | undefined;
  private id!: number;
  isLoading = false;
  isSubmitting = false;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officialsService: OfficialsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;

    if (isNaN(this.id)) {
      this.router.navigate(['/officials/list']);
      return;
    }

    this.loadOfficial();
  }

  private loadOfficial(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.officialsService.getById(this.id).subscribe({
      next: (official) => {
        this.official = official;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar oficial:', err);
        this.isLoading = false;
        this.errorMessage = 'No se pudo cargar el funcionario. Reintentando...';
        setTimeout(() => this.router.navigate(['/officials/list']), 2000);
      },
    });
  }

  onUpdate(formValue: Partial<Official>): void {
    this.isSubmitting = true;
    this.errorMessage = null;

    if (!this.official?.id_entity) {
      this.errorMessage = 'Error: id_entity no disponible';
      this.isSubmitting = false;
      return;
    }

    // Solo enviar los campos editados
    const payload: Official = {
      id_entity: this.official.id_entity,
      name: formValue.name || '',
      email: formValue.email || '',
      phone: formValue.phone || null,
      role: formValue.role || '',
      status: formValue.status || 'active',
      gps_active: formValue.gps_active ?? true,
      last_latitude: formValue.last_latitude ?? null,
      last_longitude: formValue.last_longitude ?? null,
    };

    console.log('Payload a enviar:', payload);

    this.officialsService.update(this.id, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/officials/list'], {
          queryParams: payload.id_entity 
            ? { id_entity: payload.id_entity } 
            : undefined
        });
      },
      error: (err: any) => {
        console.error('Error al actualizar oficial:', err);
        console.error('Detalles del error:', {
          status: err.status,
          statusText: err.statusText,
          error: err.error
        });
        this.isSubmitting = false;
        const errorMsg = err?.error?.detail || err?.error?.message || 
                         'Error al actualizar el funcionario. Por favor, intente nuevamente.';
        this.errorMessage = errorMsg;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/officials/list']);
  }
}