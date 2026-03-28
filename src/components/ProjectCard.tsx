import type { CIPProject } from '../types/project';
import { phaseToColor } from '../utils/markerColors';

interface Props {
  project: CIPProject;
  selected: boolean;
  onClick: (project: CIPProject) => void;
}

export default function ProjectCard({ project, selected, onClick }: Props) {
  const phaseColor = phaseToColor(project.phase);

  return (
    <button
      onClick={() => onClick(project)}
      className={`w-full text-left px-3 py-2.5 border-b border-gray-100 hover:bg-blue-50 transition-colors focus:outline-none focus:bg-blue-50 ${
        selected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
    >
      {/* Title row */}
      <div className="flex items-start gap-2">
        {/* Phase dot */}
        <span
          className="mt-1 flex-none rounded-full border-2 border-white shadow-sm"
          style={{ width: 10, height: 10, background: phaseColor, minWidth: 10 }}
        />
        <p className="text-sm font-semibold text-gray-800 leading-tight flex-1 min-w-0">
          {project.title}
        </p>
      </div>

      {/* Tags row */}
      <div className="mt-1 ml-4 flex flex-wrap gap-1 items-center">
        <span
          className="text-xs px-1.5 py-0.5 rounded font-medium text-white"
          style={{ background: phaseColor }}
        >
          {project.phase}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
          {project.category}
        </span>
        {project.distanceFromSearch !== undefined && (
          <span className="text-xs text-gray-400 ml-auto">
            {project.distanceFromSearch < 0.1
              ? `<0.1 mi`
              : `${project.distanceFromSearch.toFixed(1)} mi`}
          </span>
        )}
      </div>

      {/* Plain summary */}
      <p className="mt-1 ml-4 text-xs text-gray-500 leading-snug line-clamp-2">
        {project.plainSummary}
      </p>
    </button>
  );
}
