import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { PolygonStateService, DrawMode } from '../../../../services/api/leaflet/polygon-state.service';
import { Neighborhood } from 'src/app/models/neighborhood';

@Component({
  selector: 'app-map-tools-panel',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './map-tools-panel.component.html',
})
export class MapToolsPanelComponent implements OnInit {

  @Input() selectedNeighborhood: Neighborhood | null = null;
  @Input() saving = false;

  @Output() startDraw    = new EventEmitter<void>();
  @Output() stopDraw     = new EventEmitter<void>();
  @Output() startEdit    = new EventEmitter<void>();
  @Output() confirmEdit  = new EventEmitter<void>();
  @Output() clear        = new EventEmitter<void>();
  @Output() cancel       = new EventEmitter<void>();
  @Output() save         = new EventEmitter<void>();

  hasChanges   = false;
  coordinates: [number, number][] = [];
  drawMode: DrawMode = 'none';

  constructor(public polygonState: PolygonStateService) {}

  ngOnInit(): void {
    this.polygonState.hasChanges$.subscribe(v  => this.hasChanges   = v);
    this.polygonState.coordinates$.subscribe(v => this.coordinates  = v);
    this.polygonState.drawMode$.subscribe(v    => this.drawMode     = v);
  }
}