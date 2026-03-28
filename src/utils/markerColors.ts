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

// White SVG icon drawn inside the pin circle (viewBox 0 0 28 36, circle centered at 14,14 r≈14)
function phaseIconSvg(phase: ProjectPhase): string {
  switch (phase) {
    case 'Planning':
      // Three horizontal lines — to-do / plan list
      return `
        <line x1="9" y1="10" x2="19" y2="10" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="9" y1="14" x2="19" y2="14" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <line x1="9" y1="18" x2="15" y2="18" stroke="white" stroke-width="2" stroke-linecap="round"/>
      `;
    case 'Design':
      // Pencil pointing bottom-left
      return `
        <path d="M18 7 L21 10 L11 21 L8 18 Z" fill="white"/>
        <path d="M8 18 L11 21 L9 23 Z" fill="white"/>
        <path d="M18 7 L21 10 L20 11 L17 8 Z" fill="white" opacity="0.6"/>
      `;
    case 'Construction':
      // Hard hat — dome arc + brim + vent knob
      return `
        <path d="M8 17 Q8 8 14 8 Q20 8 20 17 Z" fill="white"/>
        <rect x="7" y="17" width="14" height="3" rx="1.5" fill="white"/>
        <rect x="12.5" y="6" width="3" height="4" rx="1" fill="white"/>
      `;
    case 'Complete':
      // Bold checkmark
      return `
        <path d="M7 14 L12 19 L21 8" stroke="white" stroke-width="2.5" fill="none"
          stroke-linecap="round" stroke-linejoin="round"/>
      `;
    case 'On Hold':
      // Pause — two vertical bars
      return `
        <rect x="8.5" y="8" width="4" height="12" rx="1.5" fill="white"/>
        <rect x="15.5" y="8" width="4" height="12" rx="1.5" fill="white"/>
      `;
    default:
      return `
        <text x="14" y="19" text-anchor="middle" font-size="13" font-weight="bold"
          fill="white" font-family="sans-serif">?</text>
      `;
  }
}

// Builds the full SVG string for a pin at any size (preserves aspect ratio 28:36)
export function createPinSvgString(phase: ProjectPhase, width = 28, height = 36): string {
  const color = phaseToColor(phase);
  const icon = phaseIconSvg(phase);
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22S28 24.5 28 14C28 6.27 21.73 0 14 0z"
        fill="${color}" stroke="rgba(0,0,0,0.2)" stroke-width="0.75"/>
      ${icon}
    </svg>
  `;
}

export function createColoredIcon(phase: ProjectPhase): L.DivIcon {
  return L.divIcon({
    className: '',
    html: createPinSvgString(phase, 28, 36),
    iconSize: [28, 36],
    iconAnchor: [14, 36],   // tip of the pin
    popupAnchor: [0, -38],  // popup appears above the pin
  });
}
