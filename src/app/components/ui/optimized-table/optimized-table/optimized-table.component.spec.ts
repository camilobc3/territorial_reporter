import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OptimizedTableComponent } from './optimized-table.component';

describe('OptimizedTableComponent', () => {
  let component: OptimizedTableComponent;
  let fixture: ComponentFixture<OptimizedTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptimizedTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OptimizedTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});