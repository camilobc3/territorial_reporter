import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationDetailComponent } from './annotation-detail.component';

describe('AnnotationDetailComponent', () => {
  let component: AnnotationDetailComponent;
  let fixture: ComponentFixture<AnnotationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnotationDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnotationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
