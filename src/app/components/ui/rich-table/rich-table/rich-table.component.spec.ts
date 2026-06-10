import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RichTableComponent } from './rich-table.component';

describe('RichTableComponent', () => {
  let component: RichTableComponent;
  let fixture: ComponentFixture<RichTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RichTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RichTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
