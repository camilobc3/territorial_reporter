// annotation-marker.util.ts
//
// Helpers para representar el estado de una anotación en el mapa
// (marcador de color) y en el panel de detalle (badge + etiqueta).

import * as L from 'leaflet';

const STATUS_COLORS: Record<string, string> = {
  open: '#2563eb', // azul - abierta
  pending: '#2563eb',
  in_progress: '#f59e0b', // ámbar - en proceso
  in_review: '#f59e0b',
  resolved: '#16a34a', // verde - resuelta
  closed: '#16a34a',
  rejected: '#dc2626', // rojo - rechazada
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Abierta',
  pending: 'Pendiente',
  in_progress: 'En proceso',
  in_review: 'En revisión',
  resolved: 'Resuelta',
  closed: 'Cerrada',
  rejected: 'Rechazada',
};

const DEFAULT_COLOR = '#6b7280'; // gris

export function getStatusColor(status: string | undefined | null): string {
  const key = (status ?? '').toLowerCase().trim();
  return STATUS_COLORS[key] ?? DEFAULT_COLOR;
}

export function getStatusLabel(status: string | undefined | null): string {
  const key = (status ?? '').toLowerCase().trim();
  return STATUS_LABELS[key] ?? (status?.trim() ? status : 'Sin estado');
}

/** Construye un ícono circular de color según el estado de la anotación. */
export function buildAnnotationIcon(status: string | undefined | null): L.DivIcon {
  const color = getStatusColor(status);

  return L.divIcon({
    className: '',
    html: `<div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

/** Lista de estados conocidos, útil para renderizar una leyenda. */
export const ANNOTATION_STATUS_LEGEND: Array<{ status: string; label: string; color: string }> = [
  { status: 'open', label: 'Abierta', color: STATUS_COLORS['open'] },
  { status: 'in_progress', label: 'En proceso', color: STATUS_COLORS['in_progress'] },
  { status: 'resolved', label: 'Resuelta', color: STATUS_COLORS['resolved'] },
  { status: 'rejected', label: 'Rechazada', color: STATUS_COLORS['rejected'] },
];