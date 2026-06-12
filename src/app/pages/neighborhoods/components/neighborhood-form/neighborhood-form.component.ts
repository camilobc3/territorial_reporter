import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { Neighborhood } from 'src/app/models/neighborhood';

@Component({
  selector: 'app-neighborhood-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './neighborhood-form.component.html',
})
export class NeighborhoodFormComponent implements OnInit, OnChanges {

  @Input() neighborhood: Neighborhood | null = null;
  /** ID de la comuna ya seleccionada en el filtro del list — se prellena automáticamente */
  @Input() selectedCommuneId: number | null = null;

  @Output() formSubmit = new EventEmitter<Partial<Neighborhood>>();
  @Output() cancelled  = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = false;

  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['neighborhood'] || changes['selectedCommuneId']) && this.form) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    this.isEditMode = !!this.neighborhood?.id_neighborhood;
    this.form = this.fb.group({
      name:         [this.neighborhood?.name   ?? '', [Validators.required, Validators.minLength(2)]],
      status:       [this.neighborhood?.status ?? 'active', Validators.required],
      id_commune:   [this.neighborhood?.id_commune ?? this.selectedCommuneId, Validators.required],
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