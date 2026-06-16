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

    const payload: Official = { 
      id_official: this.id, 
      ...(formValue as Official) 
    };

    this.officialsService.update(this.id, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/officials/list'], {
          queryParams: payload.id_entity 
            ? { id_entity: payload.id_entity } 
            : undefined
        });
      },
      error: (err) => {
        console.error('Error al actualizar oficial:', err);
        this.isSubmitting = false;
        this.errorMessage = 'Error al actualizar el funcionario. Por favor, intente nuevamente.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/officials/list']);
  }
}