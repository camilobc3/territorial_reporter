import * as L from 'leaflet';

const STATUS_COLORS: Record<string, string> = {
  open: '#2563eb',
  pending: '#2563eb',
  in_progress: '#f59e0b',
  in_review: '#f59e0b',
  resolved: '#16a34a',
  closed: '#16a34a',
  rejected: '#dc2626',
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

const DEFAULT_COLOR = '#6b7280';

export function getStatusColor(status: string | undefined | null): string {
  const key = (status ?? '').toLowerCase().trim();
  return STATUS_COLORS[key] ?? DEFAULT_COLOR;
}

export function getStatusLabel(status: string | undefined | null): string {
  const key = (status ?? '').toLowerCase().trim();
  return STATUS_LABELS[key] ?? (status?.trim() ? status : 'Sin estado');
}

export function buildAnnotationIcon(status: string | undefined | null): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div class="${getStatusMarkerClass(status)}"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

export function getStatusDotClass(status: string | undefined | null): string {
  const key = normalizedStatus(status);

  const classes: Record<string, string> = {
    open: 'bg-blue-600',
    pending: 'bg-blue-600',
    in_progress: 'bg-amber-500',
    in_review: 'bg-amber-500',
    resolved: 'bg-green-600',
    closed: 'bg-green-600',
    rejected: 'bg-red-600',
  };

  return classes[key] ?? 'bg-gray-500';
}

export function getStatusBadgeClass(status: string | undefined | null): string {
  const key = normalizedStatus(status);

  const classes: Record<string, string> = {
    open: 'bg-blue-50 text-blue-600',
    pending: 'bg-blue-50 text-blue-600',
    in_progress: 'bg-amber-50 text-amber-600',
    in_review: 'bg-amber-50 text-amber-600',
    resolved: 'bg-green-50 text-green-600',
    closed: 'bg-green-50 text-green-600',
    rejected: 'bg-red-50 text-red-600',
  };

  return classes[key] ?? 'bg-gray-50 text-gray-600';
}

export function annotationPopupHtml(idAnnotation: number, description: string | null | undefined): string {
  return `
    <strong>Anotación #${idAnnotation}</strong><br>
    ${escapeHtml(description ?? '')}
  `;
}

export const ANNOTATION_STATUS_LEGEND: Array<{ status: string; label: string; color: string }> = [
  { status: 'open', label: 'Abierta', color: STATUS_COLORS['open'] },
  { status: 'in_progress', label: 'En proceso', color: STATUS_COLORS['in_progress'] },
  { status: 'resolved', label: 'Resuelta', color: STATUS_COLORS['resolved'] },
  { status: 'rejected', label: 'Rechazada', color: STATUS_COLORS['rejected'] },
];

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizedStatus(status: string | undefined | null): string {
  return (status ?? '').toLowerCase().trim();
}

function getStatusMarkerClass(status: string | undefined | null): string {
  return [
    'inline-block',
    'w-[18px]',
    'h-[18px]',
    'rounded-full',
    'border-2',
    'border-white',
    'shadow',
    getStatusDotClass(status),
  ].join(' ');
}
