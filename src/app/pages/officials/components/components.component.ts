import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Official } from 'src/app/models/official';

@Component({
  selector: 'app-components',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './components.component.html',
  styleUrl: './components.component.scss',
})
export class ComponentsComponent implements OnInit, OnChanges {
  @Input() official?: Official;
  @Input() isSubmitting = false;
  @Output() formSubmit = new EventEmitter<Partial<Official>>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = false;
  statusOptions = ['active', 'inactive'];

  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['official'] && this.form) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    this.isEditMode = !!this.official;

    const phoneValidators = this.official?.phone 
      ? [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]
      : [];
    
    const latValidators = this.official?.last_latitude != null
      ? [Validators.min(-90), Validators.max(90)]
      : [];
    
    const longValidators = this.official?.last_longitude != null
      ? [Validators.min(-180), Validators.max(180)]
      : [];

    this.form = this.fb.group({
      name:           [this.official?.name           ?? '', Validators.required],
      email:          [this.official?.email          ?? '', [Validators.required, Validators.email]],
      phone:          [this.official?.phone          ?? ''],
      role:           [this.official?.role           ?? '', Validators.required],
      status:         [this.official?.status         ?? 'active', Validators.required],
      gps_active:     [this.official?.gps_active     ?? true],
      last_latitude:  [this.official?.last_latitude  ?? null, latValidators],
      last_longitude: [this.official?.last_longitude ?? null, longValidators],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const formValues = this.form.value;
    
    // Construir payload que será completado por el componente padre
    const payload: Partial<Official> = {
      name: formValues.name,
      email: formValues.email,
      phone: formValues.phone || null,
      role: formValues.role,
      status: formValues.status,
      gps_active: formValues.gps_active,
      last_latitude: formValues.last_latitude,
      last_longitude: formValues.last_longitude,
      id_entity: this.official?.id_entity,
    };

    console.log('Form payload (desde componente):', payload);
    this.formSubmit.emit(payload);
  }

  onCancel(): void {
    this.form.reset();
    this.cancel.emit();
  }
}
