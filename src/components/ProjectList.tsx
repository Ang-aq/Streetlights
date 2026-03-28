import type { CIPProject } from '../types/project';
import ProjectCard from './ProjectCard';

interface Props {
  projects: CIPProject[];
  selectedProject: CIPProject | null;
  searchActive: boolean;
  onSelect: (project: CIPProject) => void;
}

export default function ProjectList({ projects, selectedProject, searchActive, onSelect }: Props) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-3 py-2 bg-gray-50 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {searchActive
            ? `${projects.length} nearby project${projects.length !== 1 ? 's' : ''}`
            : `All projects (${projects.length})`}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm px-6 text-center">
            {searchActive
              ? 'No projects found nearby. Try increasing the radius or searching a different address.'
              : 'No projects match the selected filters.'}
          </div>
        ) : (
          projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              selected={selectedProject?.id === project.id}
              onClick={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}
