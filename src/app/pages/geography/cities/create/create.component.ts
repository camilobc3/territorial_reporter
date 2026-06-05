import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CityFormComponent } from '../city-form/city-form.component';
import { CityService } from '../../../../services/city.service';
import { City } from '../../../../models/city';

@Component({
  selector: 'app-city-create',
  standalone: true,
  imports: [CityFormComponent],
  template: `<app-city-form (formSubmit)="onCreate($event)" />`,
})
export class CityCreateComponent {
  constructor(private service: CityService, private router: Router) {}

  onCreate(formValue: City) {
    this.service.create(formValue).subscribe(() => {
      this.router.navigate(['/geography/cities/list']);
    });
  }
}