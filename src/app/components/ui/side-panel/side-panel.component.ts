import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SidePanelUtils } from './side-panel.utils';

@Component({
  selector: 'app-side-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './side-panel.component.html',
})
export class SidePanelComponent {

  constructor(public sidePanelUtils: SidePanelUtils) {}
}