// update.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormComponent } from '../components/form/form.component';
import { EntitiesService } from 'src/app/services/entity.service';
import { Entity } from 'src/app/models/entity';

@Component({
  selector: 'app-entity-update',
  standalone: true,
  imports: [FormComponent],
  templateUrl: './update.component.html',
})
export class UpdateComponent implements OnInit {

  entity: Entity | undefined;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private entitiesService: EntitiesService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;

    if (isNaN(this.id)) {
      this.router.navigate(['/entities/list']);
      return;
    }

    this.entitiesService.getById(this.id).subscribe({
      next: (e) => this.entity = e,
      error: () => this.router.navigate(['/entities/list']),
    });
  }

  onUpdate(fd: FormData): void {
    this.entitiesService.update(this.id, fd).subscribe({
      next: () => this.router.navigate(['/entities/list']),
      error: (err) => console.error(err),
    });
  }

  onCancel(): void {
    this.router.navigate(['/entities/list']);
  }
}