import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CitizenFormComponent } from '../components/form/form.component';
import { Citizen } from 'src/app/models/citizen';
import { CitizenService } from 'src/app/services/citizen.service';

@Component({
  selector: 'app-citizen-create',
  standalone: true,
  imports: [CitizenFormComponent],
  templateUrl: './create.component.html',
})
export class CitizenCreateComponent {

  constructor(
    private router: Router,
    private citizenService: CitizenService
  ) {}

  onCreate(formValue: Partial<Citizen>): void {
    this.citizenService.create(formValue).subscribe(() => {
      this.router.navigate(['/citizens/list']);
    });
  }
}