import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryFormComponent } from '../components/category-form/category-form.component';
import { CommonModule } from '@angular/common';
import { Category } from 'src/app/models/category';
import { CategoriesService } from 'src/app/services/categories.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [CommonModule, CategoryFormComponent],
  templateUrl: './update.component.html',
})
export class UpdateComponent implements OnInit {

  category: Category | null = null;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;

    if (isNaN(this.id)) {
      this.router.navigate(['/categories/list']);
      return;
    }

    this.categoriesService.getById(this.id).subscribe({
      next: (cat) => {
        this.category = cat;
      },
      error: () => this.router.navigate(['/categories/list'])
    });
  }

  onUpdate(event: { data: Partial<Category>; image?: File }): void {
    const formData = new FormData();
    formData.append('id_category', String(this.id));
    Object.entries(event.data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) formData.append(k, String(v));
    });
    if (event.image) formData.append('file', event.image);

    this.categoriesService.update(this.id, formData as any).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Categoría actualizada',
          text: `La categoría "${event.data.name}" se actualizó correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
        this.router.navigate(['/categories/list']);
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la categoría. Intenta nuevamente.',
        });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/categories/list']);
  }
}