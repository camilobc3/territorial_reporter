import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Official } from 'src/app/models/official';
import { OfficialsService } from 'src/app/services/officials.service';
import { ComponentsComponent } from '../components/components.component';

@Component({
  selector: 'app-update',
  standalone: true,
  imports: [ComponentsComponent],
  templateUrl: './update.component.html',
  styleUrl: './update.component.scss',
})
export class UpdateComponent implements OnInit {
  official: Official | undefined;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officialsService: OfficialsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;

    if (isNaN(this.id)) {
      this.router.navigate(['/officials/list']);
      return;
    }

    this.officialsService.getById(this.id).subscribe({
      next: (official) => this.official = official,
      error: () => this.router.navigate(['/officials/list']),
    });
  }

  onUpdate(formValue: Partial<Official>): void {
    const payload: Official = { id_official: this.id, ...(formValue as Official) };
    this.officialsService.update(this.id, payload).subscribe(() => {
      this.router.navigate(['/officials/list']);
    });
  }

  onCancel(): void {
    this.router.navigate(['/officials/list']);
  }
}
