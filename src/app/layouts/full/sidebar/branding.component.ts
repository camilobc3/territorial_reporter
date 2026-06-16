import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `
    <a href="/dashboard" class="logodark flex items-center gap-3 m-2 no-underline">
      <span class="inline-flex items-center justify-center size-10 rounded-xl bg-primary text-white font-semibold">
        RT
      </span>
      <span class="text-lg font-semibold text-dark">Reporte Territorial</span>
    </a>

    <a href="/dashboard" class="logolight flex items-center gap-3 m-2 no-underline">
      <span class="inline-flex items-center justify-center size-10 rounded-xl bg-white text-primary font-semibold">
        RT
      </span>
      <span class="text-lg font-semibold text-white">Reporte Territorial</span>
    </a>
  `,
})
export class BrandingComponent {
  options = this.settings.getOptions();
  constructor(private settings: CoreService) {}
}
