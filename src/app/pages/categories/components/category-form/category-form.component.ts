import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Category } from 'src/app/models/category';
import { CategoriesService } from 'src/app/services/categories.service';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './category-form.component.html',
})
export class CategoryFormComponent implements OnInit {

  /** Si se recibe una categoría, el formulario entra en modo edición */
  @Input() category: Category | null = null;

  /** Emite los datos del formulario + archivo de imagen (si se seleccionó) */
  @Output() formSubmit = new EventEmitter<{ data: Partial<Category>; image?: File }>();

  /** Emite cuando el usuario cancela */
  @Output() cancelled = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = false;

  /** Lista de categorías padre disponibles para el select */
  parentCategories: Category[] = [];

  /** Preview de la imagen seleccionada */
  imagePreview: string | null = null;
  selectedFile: File | null = null;

  /** Nombre del archivo seleccionado para mostrar en UI */
  selectedFileName = '';

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoriesService
  ) {}

  ngOnInit(): void {
    this.isEditMode = !!this.category;

    this.form = this.fb.group({
      name: [this.category?.name ?? '', [Validators.required, Validators.minLength(2)]],
      description: [this.category?.description ?? ''],
      id_parent_category: [this.category?.id_parent_category ?? null],
      status: [this.category?.status ?? 'active', Validators.required],
    });

    // Si estamos editando y tiene imagen, mostrar preview
    if (this.category?.image_url) {
      this.imagePreview = this.category.image_url;
    }

    this.loadParentCategories();
  }

  /** Getter de controles para acceso rápido en el template */
  get f() {
    return this.form.controls;
  }

  loadParentCategories(): void {
    this.categoriesService.getAll().subscribe({
      next: (cats) => {
        // Excluir la categoría actual para evitar que se asigne como padre de sí misma
        this.parentCategories = cats.filter(
          (c) => c.id_category !== this.category?.id_category
        );
      },
      error: () => {
        this.parentCategories = [];
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.selectedFile = file;
    this.selectedFileName = file.name;

    // Generar preview local
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit({
      data: this.form.value,
      image: this.selectedFile ?? undefined,
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}