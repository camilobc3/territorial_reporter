import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CityFormComponent } from '../city-form/city-form.component';
import { CityService } from '../../../../services/city.service';
import { City } from '../../../../models/city';

@Component({
  selector: 'app-city-update',
  standalone: true,
  imports: [CityFormComponent],
  template: `
    @if (city) {
      <app-city-form [city]="city" (formSubmit)="onUpdate($event)" />
    } @else {
      <p>Cargando ciudad...</p>
    }
  `,
})
export class CityUpdateComponent implements OnInit {
  city?: City;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: CityService,
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;
    if (isNaN(this.id)) { this.router.navigate(['/geography/cities/list']); return; }

    this.service.getById(this.id).subscribe({
      next: (c) => (this.city = c),
      error: () => this.router.navigate(['/geography/cities/list']),
    });
  }

  onUpdate(formValue: City) {
    this.service.update(this.id, { ...formValue, id_city: this.id }).subscribe(() => {
      this.router.navigate(['/geography/cities/list']);
    });
  }
}