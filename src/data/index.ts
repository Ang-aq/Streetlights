import rawProjects from './projects.json';
import type { CIPProject } from '../types/project';

// The JSON is already typed and has plainSummary generated at geocode time.
// We cast and re-export as the authoritative project list.
export const projects: CIPProject[] = rawProjects as CIPProject[];

export default projects;
