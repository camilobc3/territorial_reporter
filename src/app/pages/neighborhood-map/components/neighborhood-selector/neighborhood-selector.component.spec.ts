import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NeighborhoodSelectorComponent } from './neighborhood-selector.component';

describe('NeighborhoodSelectorComponent', () => {
  let component: NeighborhoodSelectorComponent;
  let fixture: ComponentFixture<NeighborhoodSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NeighborhoodSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NeighborhoodSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
