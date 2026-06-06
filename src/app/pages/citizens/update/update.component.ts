import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CitizenFormComponent } from '../components/form/form.component';
import { CitizenService } from 'src/app/services/citizen.service';
import { Citizen } from 'src/app/models/citizen';

@Component({
  selector: 'app-citizen-update',
  standalone: true,
  imports: [CitizenFormComponent],
  templateUrl: './update.component.html',
})
export class CitizenUpdateComponent implements OnInit {

  citizen: Citizen | undefined;
  private id!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private citizenService: CitizenService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : NaN;

    if (isNaN(this.id)) {
      this.router.navigate(['/citizens/list']);
      return;
    }

    this.citizenService.getById(this.id).subscribe({
      next: (c) => this.citizen = c,
      error: () => this.router.navigate(['/citizens/list'])
    });
  }

  onUpdate(formValue: Partial<Citizen>): void {
    const payload: Citizen = { id_citizen: this.id, ...(formValue as Citizen) };
    this.citizenService.update(this.id, payload).subscribe(() => {
      this.router.navigate(['/citizens/list']);
    });
  }
}