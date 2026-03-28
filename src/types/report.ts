export type ReportTypeId =
  | 'streetlight'
  | 'stoplight'
  | 'pothole'
  | 'unpaved'
  | 'sidewalk'
  | 'flooding';

export interface ReportTypeDef {
  id: ReportTypeId;
  label: string;
  color: string; // background color for the marker
}

export const REPORT_TYPES: ReportTypeDef[] = [
  { id: 'streetlight', label: 'Streetlight Out',    color: '#f59e0b' },
  { id: 'stoplight',   label: 'Broken Stoplight',   color: '#ef4444' },
  { id: 'pothole',     label: 'Pothole',             color: '#78350f' },
  { id: 'unpaved',     label: 'Unpaved Road',        color: '#92400e' },
  { id: 'sidewalk',    label: 'Damaged Sidewalk',    color: '#6b7280' },
  { id: 'flooding',    label: 'Flooding',            color: '#2563eb' },
];

export interface Report {
  id: string;
  typeId: ReportTypeId;
  lat: number;
  lng: number;
  likes: number;
  createdAt: number; // Date.now()
}
