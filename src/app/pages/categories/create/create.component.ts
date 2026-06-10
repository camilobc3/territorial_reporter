import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryFormComponent } from '../components/category-form/category-form.component';
import { Category } from 'src/app/models/category';
import { CategoriesService } from 'src/app/services/categories.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [CategoryFormComponent],
  templateUrl: './create.component.html',
})
export class CreateComponent {

  constructor(
    private router: Router,
    private categoriesService: CategoriesService
  ) {}

  onCreate(event: { data: Partial<Category>; image?: File }): void {
    const formData = new FormData();
    Object.entries(event.data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, String(v));
    });
    if (event.image) formData.append('file', event.image);

    this.categoriesService.create(formData as any).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Categoría creada',
          text: `La categoría "${event.data.name}" se creó correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.router.navigate(['/categories/list']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo crear la categoría. Intenta nuevamente.',
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/categories/list']);
  }
}