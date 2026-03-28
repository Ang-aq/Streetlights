import type { ReportTypeId } from '../types/report';

/** Returns the SVG inner elements for each report type using lucide icon paths (24×24 viewBox). */
export function reportIconPaths(typeId: ReportTypeId): string {
  const s = 'stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  switch (typeId) {
    case 'streetlight': // Lamp
      return `
        <path ${s} d="M12 12v6"/>
        <path ${s} d="M4.077 10.615A1 1 0 0 0 5 12h14a1 1 0 0 0 .923-1.385l-3.077-7.384A2 2 0 0 0 15 2H9a2 2 0 0 0-1.846 1.23Z"/>
        <path ${s} d="M8 20a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z"/>
      `;
    case 'stoplight': // TrafficCone
      return `
        <path ${s} d="M16.05 10.966a5 2.5 0 0 1-8.1 0"/>
        <path ${s} d="m16.923 14.049 4.48 2.04a1 1 0 0 1 .001 1.831l-8.574 3.9a2 2 0 0 1-1.66 0l-8.574-3.91a1 1 0 0 1 0-1.83l4.484-2.04"/>
        <path ${s} d="M16.949 14.14a5 2.5 0 1 1-9.9 0L10.063 3.5a2 2 0 0 1 3.874 0z"/>
        <path ${s} d="M9.194 6.57a5 2.5 0 0 0 5.61 0"/>
      `;
    case 'pothole': // Construction
      return `
        <rect x="2" y="6" width="20" height="8" rx="1" ${s}/>
        <path ${s} d="M17 14v7"/>
        <path ${s} d="M7 14v7"/>
        <path ${s} d="M17 3v3"/>
        <path ${s} d="M7 3v3"/>
        <path ${s} d="M10 14 2.3 6.3"/>
        <path ${s} d="m14 6 7.7 7.7"/>
        <path ${s} d="m8 6 8 8"/>
      `;
    case 'unpaved': // Milestone
      return `
        <path ${s} d="M12 13v8"/>
        <path ${s} d="M12 3v3"/>
        <path ${s} d="M18.172 6a2 2 0 0 1 1.414.586l2.06 2.06a1.207 1.207 0 0 1 0 1.708l-2.06 2.06a2 2 0 0 1-1.414.586H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1z"/>
      `;
    case 'sidewalk': // Footprints
      return `
        <path ${s} d="M4 16v-2.38C4 11.5 2.97 10.5 3 8c.03-2.72 1.49-6 4.5-6C9.37 2 10 3.8 10 5.5c0 3.11-2 5.66-2 8.68V16a2 2 0 1 1-4 0Z"/>
        <path ${s} d="M20 20v-2.38c0-2.12 1.03-3.12 1-5.62-.03-2.72-1.49-6-4.5-6C14.63 6 14 7.8 14 9.5c0 3.11 2 5.66 2 8.68V20a2 2 0 1 0 4 0Z"/>
        <path ${s} d="M16 17h4"/>
        <path ${s} d="M4 13h4"/>
      `;
    case 'flooding': // Waves
      return `
        <path ${s} d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path ${s} d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
        <path ${s} d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
      `;
    default:
      return `<circle cx="12" cy="12" r="5" stroke="white" stroke-width="2" fill="none"/>`;
  }
}

/** Builds a full SVG string for use in icon tiles.
 * @deprecated Use the ReportIcon React component instead. */
export function reportIconSvg(typeId: ReportTypeId, size = 28, color = '#f97316'): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="12" fill="${color}"/>
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
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
        ${reportIconPaths(typeId)}
      </svg>
    </div>
    ${badge}
  </div>`;
}
