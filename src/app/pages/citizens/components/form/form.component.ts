import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import { Citizen } from 'src/app/models/citizen';

@Component({
  selector: 'app-citizen-form',
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
  templateUrl: './form.component.html',
})
export class CitizenFormComponent implements OnInit {
  @Input() citizen?: Citizen;
  @Output() formSubmit = new EventEmitter<Citizen>();

  form!: FormGroup;
  isEditMode = false;

  statusOptions = ['active', 'inactive'];

  get f() { return this.form.controls; }

  constructor(private fb: FormBuilder, private router: Router) {}

  ngOnInit(): void {
    this.isEditMode = !!this.citizen;

    this.form = this.fb.group({
      name:      [this.citizen?.name      ?? '', Validators.required],
      email:     [this.citizen?.email     ?? '', [Validators.required, Validators.email]],
      phone:     [this.citizen?.phone     ?? '', [Validators.pattern(/^[0-9+\-\s()]{7,20}$/)]],
      address:   [this.citizen?.address   ?? ''],
      latitude:  [this.citizen?.latitude  ?? null, [Validators.min(-90),  Validators.max(90)]],
      longitude: [this.citizen?.longitude ?? null, [Validators.min(-180), Validators.max(180)]],
      status:    [this.citizen?.status    ?? 'active', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload: Citizen = {
      ...this.citizen,
      ...this.form.value,
    };

    this.formSubmit.emit(payload);
  }

  onCancel(): void {
    this.form.reset();
    this.router.navigate(['/citizens/list']);
  }
}