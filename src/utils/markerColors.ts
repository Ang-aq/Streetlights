import type { ProjectPhase } from '../types/project';
import L from 'leaflet';

export function phaseToColor(phase: ProjectPhase): string {
  switch (phase) {
    case 'Planning':     return '#f59e0b'; // amber
    case 'Design':       return '#3b82f6'; // blue
    case 'Construction': return '#ef4444'; // red
    case 'Complete':     return '#22c55e'; // green
    case 'On Hold':      return '#6b7280'; // gray
    default:             return '#8b5cf6'; // purple
  }
}

export function createColoredIcon(phase: ProjectPhase): L.DivIcon {
  const color = phaseToColor(phase);
  return L.divIcon({
    className: '',
    html: `<div style="
      width: 14px;
      height: 14px;
      background: ${color};
      border: 2px solid white;
      border-radius: 50%;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}
