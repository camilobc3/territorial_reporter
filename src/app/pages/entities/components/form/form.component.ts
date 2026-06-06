// form.component.ts
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { Entity } from 'src/app/models/entity';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, NgScrollbarModule],
  templateUrl: './form.component.html',
})
export class FormComponent implements OnInit, OnChanges {
  @Input() entity?: Entity;
  @Output() formSubmit = new EventEmitter<FormData>();
  @Output() cancel = new EventEmitter<void>();

  form!: FormGroup;
  isEditMode = false;
  submitting = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isDragOver = false;

  get f() {
    return this.form.controls;
  }

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['entity'] && this.form) {
      this.buildForm();
    }
  }

  private buildForm() {
    this.isEditMode = !!this.entity?.id_entity;
    this.previewUrl = this.entity?.logo_url
      ? `/api/images/${this.entity.logo_url}`
      : null;
    this.selectedFile = null;

    this.form = this.fb.group({
      name:    [this.entity?.name    ?? '', Validators.required],
      nit:     [this.entity?.nit     ?? ''],
      phone:   [this.entity?.phone   ?? ''],
      email:   [this.entity?.email   ?? '', [Validators.email]],
      address: [this.entity?.address ?? ''],
      status:  [this.entity?.status  ?? 'active', Validators.required],
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setFile(input.files[0]);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      this.setFile(file);
    }
  }

  private setFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo no puede superar 2 MB.');
      return;
    }
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const fd = new FormData();
    Object.entries(this.form.value).forEach(([key, value]) => {
      fd.append(key, (value as string) ?? '');
    });
    if (this.selectedFile) {
      fd.append('file', this.selectedFile);
    }

    this.submitting = true;
    this.formSubmit.emit(fd);
  }

  stopSubmitting() {
    this.submitting = false;
  }

  onCancel() {
    this.cancel.emit();
  }
}