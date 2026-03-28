export type ProjectPhase =
  | 'Planning'
  | 'Design'
  | 'Construction'
  | 'Complete'
  | 'On Hold'
  | 'Unknown';

export type ProjectCategory =
  | 'Roads & Bridges'
  | 'Utilities'
  | 'Parks & Recreation'
  | 'Public Safety'
  | 'Schools'
  | 'Facilities'
  | 'Other';

export interface CIPProject {
  id: string;
  title: string;
  description: string;
  location: string;
  category: ProjectCategory;
  phase: ProjectPhase;
  totalBudget: number;
  spentToDate: number;
  estimatedCompletion: string;
  lat: number;
  lng: number;
  geocodeFallback: boolean;
  plainSummary: string;
  manager?: string;
  email?: string;
  phone?: string;
  distanceFromSearch?: number;
}
