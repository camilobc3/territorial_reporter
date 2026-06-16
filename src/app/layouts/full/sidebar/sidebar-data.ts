import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Inicio',
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:widget-5-line-duotone',
    route: '/dashboard',
  },

  {
    navCap: 'Administración',
  },
  {
    displayName: 'Usuarios',
    iconName: 'solar:users-group-rounded-line-duotone',
    route: '/users/list',
  },
  {
    displayName: 'Entidades',
    iconName: 'solar:buildings-2-line-duotone',
    route: '/entities/list',
  },
  {
    displayName: 'Funcionarios',
    iconName: 'solar:user-id-line-duotone',
    route: '/officials/list',
  },
  {
    displayName: 'Ciudadanos',
    iconName: 'solar:user-hand-up-line-duotone',
    route: '/citizens/list',
  },

  {
    navCap: 'Territorio',
  },
  {
    displayName: 'Categorías',
    iconName: 'solar:tag-line-duotone',
    route: '/categories/list',
  },
  {
    displayName: 'Comunas',
    iconName: 'solar:city-line-duotone',
    route: '/communes/list',
  },
  {
    displayName: 'Barrios',
    iconName: 'solar:home-smile-line-duotone',
    route: '/neighborhoods/list',
  },
  {
    displayName: 'Mapa de barrios',
    iconName: 'solar:map-point-wave-line-duotone',
    route: '/neighborhoods-map/map',
  },

  {
    navCap: 'Participación',
  },
  {
    displayName: 'Anotaciones',
    iconName: 'solar:clipboard-text-line-duotone',
    route: '/annotations/list',
    children: [
      {
        displayName: 'Listado',
        iconName: 'tabler:point',
        route: '/annotations/list',
      },
      {
        displayName: 'Crear anotación',
        iconName: 'tabler:point',
        route: '/annotations/create',
      },
    ],
  },
  {
    displayName: 'Calificaciones',
    iconName: 'solar:star-line-duotone',
    route: '/votes/list',
    children: [
      {
        displayName: 'Mis calificaciones',
        iconName: 'tabler:point',
        route: '/votes/list',
      },
      {
        displayName: 'Calificar anotación',
        iconName: 'tabler:point',
        route: '/votes/create',
      },
    ],
  },

  {
    navCap: 'Operación',
  },
  {
    displayName: 'Seguimiento',
    iconName: 'solar:radar-2-line-duotone',
    route: '/tracking',
  },
  {
    displayName: 'Reportes',
    iconName: 'solar:chart-square-line-duotone',
    route: '/reports',
  },
];
