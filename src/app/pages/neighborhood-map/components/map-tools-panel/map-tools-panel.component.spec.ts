import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapToolsPanelComponent } from './map-tools-panel.component';

describe('MapToolsPanelComponent', () => {
  let component: MapToolsPanelComponent;
  let fixture: ComponentFixture<MapToolsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapToolsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapToolsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
