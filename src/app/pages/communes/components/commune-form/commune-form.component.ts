import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Commune } from 'src/app/models/commune';

@Component({
  selector: 'app-commune-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './commune-form.component.html',
})
export class CommuneFormComponent implements OnInit, OnChanges {

  @Input() commune: Commune | null = null;
  /** ID de la ciudad ya seleccionada en el filtro del list — se prellena automáticamente */
  @Input() selectedCityId: number | null = null;

  @Output() formSubmit = new EventEmitter<Partial<Commune>>();
  @Output() cancelled  = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = false;

  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['commune'] || changes['selectedCityId']) && this.form) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    this.isEditMode = !!this.commune?.id_commune;
    this.form = this.fb.group({
      name:    [this.commune?.name   ?? '', [Validators.required, Validators.minLength(2)]],
      status:  [this.commune?.status ?? 'active', Validators.required],
      id_city: [this.commune?.id_city ?? this.selectedCityId, Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.formSubmit.emit(this.form.value);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}