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

    this.form = this.fb.group({
      name: [this.official?.name ?? '', Validators.required],
      email: [this.official?.email ?? '', [Validators.required, Validators.email]],
      phone: [this.official?.phone ?? '', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      role: [this.official?.role ?? '', Validators.required],
      status: [this.official?.status ?? 'active', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload: Partial<Official> = {
      ...this.official,
      ...this.form.value,
    };

    this.formSubmit.emit(payload);
  }

  onCancel(): void {
    this.form.reset();
    this.cancel.emit();
  }
}
