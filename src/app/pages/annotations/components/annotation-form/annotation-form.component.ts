// annotation-form.component.ts
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Category } from 'src/app/models/category';
import { Entity } from 'src/app/models/entity';
import { AnnotationFormPayload } from '../../types/annotation-form.types';
import { getCategoryIcon } from '../../category-icon.util';
import Swal from 'sweetalert2';

interface PhotoPreview {
  file: File;
  url: string;
}

const MAX_PHOTOS = 5;
const MAX_PHOTO_SIZE = 5 * 1024 * 1024; // 5MB

@Component({
  selector: 'app-annotation-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './annotation-form.component.html',
})
export class AnnotationFormComponent implements OnChanges {

  /** Coordenadas seleccionadas en el mapa (provistas por el componente padre). */
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;

  /** Catálogos cargados desde el backend. */
  @Input() categories: Category[] = [];
  @Input() entities: Entity[] = [];

  @Input() loading = false;
  @Input() saving = false;

  /** Emite el payload listo para crear la anotación + relaciones. */
  @Output() formSubmit = new EventEmitter<AnnotationFormPayload>();
  @Output() cancelled = new EventEmitter<void>();
  /** Emite cuando el usuario edita manualmente la latitud/longitud. */
  @Output() locationChange = new EventEmitter<{ latitude: number; longitude: number }>();

  form: FormGroup;

  readonly maxDescription = 500;
  readonly maxPhotos = MAX_PHOTOS;

  selectedCategoryIds = new Set<number>();
  categorySearch = '';

  selectedEntityIds = new Set<number>();
  entitySearch = '';

  photos: PhotoPreview[] = [];
  isDragOver = false;

  showErrors = false;

  get f() {
    return this.form.controls;
  }

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      latitude: [null as number | null, [Validators.required]],
      longitude: [null as number | null, [Validators.required]],
      description: ['', [Validators.required, Validators.maxLength(this.maxDescription)]],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['latitude'] || changes['longitude']) {
      this.form.patchValue(
        { latitude: this.latitude, longitude: this.longitude },
        { emitEvent: false }
      );
    }
  }

  // ── Categorías ─────────────────────────────────────────────────────────

  get filteredCategories(): Category[] {
    const q = this.categorySearch.trim().toLowerCase();
    if (!q) return this.categories;
    return this.categories.filter((c) => c.name.toLowerCase().includes(q));
  }

  iconFor(category: Category): string {
    return getCategoryIcon(category.name);
  }

  isCategorySelected(category: Category): boolean {
    return category.id_category != null && this.selectedCategoryIds.has(category.id_category);
  }

  toggleCategory(category: Category): void {
    if (category.id_category == null) return;
    if (this.selectedCategoryIds.has(category.id_category)) {
      this.selectedCategoryIds.delete(category.id_category);
    } else {
      this.selectedCategoryIds.add(category.id_category);
    }
  }

  /** Permite preseleccionar una categoría desde el filtro superior del mapa. */
  preselectCategory(idCategory: number): void {
    this.selectedCategoryIds.add(idCategory);
  }

  get hasCategoryError(): boolean {
    return this.showErrors && this.selectedCategoryIds.size === 0;
  }

  // ── Entidades de interés ───────────────────────────────────────────────

  get selectedEntities(): Entity[] {
    return this.entities.filter((e) => e.id_entity != null && this.selectedEntityIds.has(e.id_entity));
  }

  get filteredEntities(): Entity[] {
    const q = this.entitySearch.trim().toLowerCase();
    const available = this.entities.filter(
      (e) => e.id_entity != null && !this.selectedEntityIds.has(e.id_entity)
    );
    if (!q) return available;
    return available.filter((e) => (e.name ?? '').toLowerCase().includes(q));
  }

  addEntity(entity: Entity): void {
    if (entity.id_entity == null) return;
    this.selectedEntityIds.add(entity.id_entity);
    this.entitySearch = '';
  }

  removeEntity(entity: Entity): void {
    if (entity.id_entity == null) return;
    this.selectedEntityIds.delete(entity.id_entity);
  }

  get hasEntityError(): boolean {
    return this.showErrors && this.selectedEntityIds.size === 0;
  }

  // ── Fotografías ────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(Array.from(input.files));
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(): void {
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    if (event.dataTransfer?.files) this.addFiles(Array.from(event.dataTransfer.files));
  }

  private addFiles(files: File[]): void {
    for (const file of files) {
      if (this.photos.length >= this.maxPhotos) {
        Swal.fire({
          icon: 'warning',
          title: 'Límite alcanzado',
          text: `Solo puedes adjuntar hasta ${this.maxPhotos} fotografías.`,
        });
        break;
      }

      if (!file.type.startsWith('image/')) {
        continue;
      }

      if (file.size > MAX_PHOTO_SIZE) {
        Swal.fire({
          icon: 'warning',
          title: 'Archivo muy grande',
          text: `"${file.name}" supera el tamaño máximo de 5MB.`,
        });
        continue;
      }

      this.photos.push({ file, url: URL.createObjectURL(file) });
    }
  }

  removePhoto(index: number): void {
    const photo = this.photos[index];
    if (photo) URL.revokeObjectURL(photo.url);
    this.photos.splice(index, 1);
  }

  // ── Envío del formulario ───────────────────────────────────────────────

  onSubmit(): void {
    this.showErrors = true;

    if (this.form.invalid || this.selectedCategoryIds.size === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.formSubmit.emit({
      description: this.form.value.description,
      latitude: Number(this.form.value.latitude),
      longitude: Number(this.form.value.longitude),
      categoryIds: Array.from(this.selectedCategoryIds),
      entityIds: Array.from(this.selectedEntityIds),
      photos: this.photos.map((p) => p.file),
    });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  /** Cuando el usuario edita manualmente la latitud/longitud. */
  onLocationInput(): void {
    const lat = Number(this.form.value.latitude);
    const lng = Number(this.form.value.longitude);

    if (!isNaN(lat) && !isNaN(lng)) {
      this.locationChange.emit({ latitude: lat, longitude: lng });
    }
  }

  /** Limpia el formulario por completo (usado por el componente padre tras guardar/cancelar). */
  reset(): void {
    this.form.reset();
    this.selectedCategoryIds.clear();
    this.selectedEntityIds.clear();
    this.photos.forEach((p) => URL.revokeObjectURL(p.url));
    this.photos = [];
    this.categorySearch = '';
    this.entitySearch = '';
    this.showErrors = false;
  }
}
