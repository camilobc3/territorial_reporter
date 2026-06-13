import { officerIconHtml, officerPopupHtml } from './map.helper.template';
import { OfficerMarker } from '../models/officer-marker';
import * as L from 'leaflet';

export function buildOfficerIcon(officer: OfficerMarker): L.DivIcon {
  return L.divIcon({
    className:  '',
    html:       officerIconHtml(getInitials(officer.name)),
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
  });
}

export function buildOfficerPopup(officer: OfficerMarker): string {
  return officerPopupHtml(officer.name, officer.entity, officer.status === 'online');
}

function getInitials(name: string): string {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}