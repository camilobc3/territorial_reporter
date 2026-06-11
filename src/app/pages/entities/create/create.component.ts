// create.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormComponent } from '../components/form/form.component';
import { EntitiesService } from 'src/app/services/entity.service';

@Component({
  selector: 'app-entity-create',
  standalone: true,
  imports: [FormComponent],
  templateUrl: './create.component.html',
})
export class CreateComponent {

  constructor(
    private router: Router,
    private entitiesService: EntitiesService
  ) {}

  onCreate(fd: FormData): void {
    this.entitiesService.create(fd).subscribe({
      next: () => this.router.navigate(['/entities/list']),
      error: (err) => console.error(err),
    });
  }

  onCancel(): void {
    this.router.navigate(['/entities/list']);
  }
}