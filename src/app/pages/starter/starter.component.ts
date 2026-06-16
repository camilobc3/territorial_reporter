import { Component, ViewEncapsulation } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../material.module';

@Component({
  selector: 'app-starter',
  imports: [
    NgClass,
    MaterialModule,
    RouterModule,
  ],
  templateUrl: './starter.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class StarterComponent {
  readonly summaryCards = [
    {
      label: 'Anotaciones territoriales',
      value: 'Gestión ciudadana',
      icon: 'assignment',
      route: '/annotations/list',
      tone: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Seguimiento operativo',
      value: 'Funcionarios en campo',
      icon: 'radar',
      route: '/tracking',
      tone: 'bg-emerald-50 text-emerald-700',
    },
    {
      label: 'Territorio',
      value: 'Comunas y barrios',
      icon: 'map',
      route: '/neighborhoods-map/map',
      tone: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Reportes',
      value: 'Análisis territorial',
      icon: 'query_stats',
      route: '/reports',
      tone: 'bg-purple-50 text-purple-700',
    },
  ];

  readonly quickActions = [
    { label: 'Crear anotación', description: 'Registrar una novedad territorial con ubicación y evidencias.', route: '/annotations/create', icon: 'add_location_alt' },
    { label: 'Calificar anotación', description: 'Valorar anotaciones existentes desde el mapa.', route: '/votes/create', icon: 'star_rate' },
    { label: 'Ver entidades', description: 'Administrar entidades y consultar sus funcionarios.', route: '/entities/list', icon: 'business' },
    { label: 'Gestionar barrios', description: 'Consultar barrios y demarcar su zona en el mapa.', route: '/neighborhoods/list', icon: 'holiday_village' },
  ];
}
