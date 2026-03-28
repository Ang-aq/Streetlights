import type { ReportTypeId } from '../types/report';

/** Returns the SVG inner elements (paths/shapes) for each report type, white-filled. */
export function reportIconPaths(typeId: ReportTypeId): string {
  switch (typeId) {
    case 'streetlight':
      // Streetlight silhouette: pole + arm + bulb
      return `
        <rect x="13" y="10" width="2" height="12" rx="1" fill="white"/>
        <rect x="10" y="8" width="8" height="3" rx="1.5" fill="white"/>
        <circle cx="18" cy="7" r="2.5" fill="white"/>
      `;
    case 'stoplight':
      // Traffic light housing + 3 dots
      return `
        <rect x="10" y="6" width="8" height="16" rx="2" fill="white"/>
        <circle cx="14" cy="9.5" r="1.5" fill="currentColor" opacity="0.5"/>
        <circle cx="14" cy="14" r="1.5" fill="currentColor" opacity="0.5"/>
        <circle cx="14" cy="18.5" r="1.5" fill="currentColor" opacity="0.5"/>
      `;
    case 'pothole':
      // Cracked hole — irregular oval + crack lines
      return `
        <ellipse cx="14" cy="16" rx="6" ry="4" fill="white" opacity="0.9"/>
        <ellipse cx="14" cy="16" rx="3.5" ry="2" fill="white" opacity="0.4"/>
        <path d="M14 12 L13 9 M14 12 L16 9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
      `;
    case 'unpaved':
      // Wavy road — two wavy lines
      return `
        <path d="M8 12 Q11 10 14 12 Q17 14 20 12" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M8 17 Q11 15 14 17 Q17 19 20 17" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      `;
    case 'sidewalk':
      // Cracked sidewalk — rectangle with diagonal crack
      return `
        <rect x="8" y="10" width="12" height="8" rx="1" fill="white" opacity="0.9"/>
        <path d="M13 10 L11 18" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" stroke-linecap="round"/>
        <path d="M16 10 L15 14 L17 18" stroke="rgba(0,0,0,0.3)" stroke-width="1.5" stroke-linecap="round"/>
      `;
    case 'flooding':
      // Water waves
      return `
        <path d="M7 13 Q9.5 10 12 13 Q14.5 16 17 13 Q19.5 10 21 13" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
        <path d="M7 18 Q9.5 15 12 18 Q14.5 21 17 18 Q19.5 15 21 18" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/>
      `;
    default:
      return `<circle cx="14" cy="14" r="5" fill="white"/>`;
  }
}

/** Builds a full SVG string for use in ReportModal icon tiles. */
export function reportIconSvg(typeId: ReportTypeId, size = 28, color = '#f97316'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28"
    style="color:${color}">
    <circle cx="14" cy="14" r="14" fill="${color}"/>
    ${reportIconPaths(typeId)}
  </svg>`;
}

/** Builds the HTML string for a Leaflet DivIcon report marker.
 *  Orange circle with white icon + optional blue likes badge. */
export function reportMarkerHtml(typeId: ReportTypeId, bgColor: string, likes: number): string {
  const badge = likes > 0
    ? `<div style="
        position:absolute;top:-6px;right:-6px;
        background:#2563eb;color:white;
        font-size:10px;font-weight:700;
        border-radius:999px;
        min-width:16px;height:16px;
        padding:0 3px;
        display:flex;align-items:center;justify-content:center;
        border:1px solid white;
        line-height:1;
      ">${likes}</div>`
    : '';

  return `<div style="position:relative;display:inline-block;">
    <div style="
      width:32px;height:32px;
      background:${bgColor};
      border-radius:50%;
      border:2px solid white;
      box-shadow:0 2px 6px rgba(0,0,0,0.4);
      display:flex;align-items:center;justify-content:center;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 28 28" style="color:${bgColor}">
        ${reportIconPaths(typeId)}
      </svg>
    </div>
    ${badge}
  </div>`;
}
