import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Official } from 'src/app/models/official';
import { OfficialsService } from 'src/app/services/officials.service';
import { ComponentsComponent } from '../components/components.component';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [ComponentsComponent],
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
})
export class CreateComponent implements OnInit {
  private idEntity!: number;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private officialsService: OfficialsService
  ) {}

  ngOnInit(): void {
    const idEntityParam = this.route.snapshot.queryParamMap.get('id_entity');
    this.idEntity = idEntityParam ? Number(idEntityParam) : NaN;

    if (Number.isNaN(this.idEntity)) {
      this.router.navigate(['/officials/list']);
    }
  }

  onCreate(formValue: Partial<Official>): void {
    const payload: Omit<Official, 'id_official'> = {
      id_entity:      this.idEntity,
      name:           formValue.name           ?? '',
      email:          formValue.email          ?? '',
      phone:          formValue.phone          ?? null,
      role:           formValue.role           ?? '',
      status:         formValue.status         ?? 'active',
      gps_active:     formValue.gps_active     ?? true,       // ← antes era false
      last_latitude:  formValue.last_latitude  ?? 5.0703,     // ← antes era undefined
      last_longitude: formValue.last_longitude ?? -75.5138,   // ← antes era undefined
    };

    this.officialsService.create(payload).subscribe(() => {
      this.router.navigate(['/officials/list'], {
        queryParams: { id_entity: this.idEntity },
      });
    });
  }

  onCancel(): void {
    this.router.navigate(['/officials/list'], {
      queryParams: Number.isNaN(this.idEntity) ? undefined : { id_entity: this.idEntity },
    });
  }
}
