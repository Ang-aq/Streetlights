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
      className={`w-full text-left px-3 py-2 border-b border-gray-100 hover:bg-slate-50 transition-colors focus:outline-none focus:bg-slate-50 ${
        selected ? 'bg-slate-50 border-l-4 border-l-slate-700' : ''
      }`}
    >
      {/* Title row */}
      <div className="flex items-center gap-2">
        <span
          className="flex-none rounded-full"
          style={{ width: 8, height: 8, background: phaseColor, minWidth: 8 }}
        />
        <p className="text-sm font-semibold text-gray-800 leading-tight flex-1 min-w-0 truncate">
          {project.title}
        </p>
        {project.distanceFromSearch !== undefined && (
          <span className="text-xs text-gray-400 flex-none ml-1">
            {project.distanceFromSearch < 0.1
              ? `<0.1 mi`
              : `${project.distanceFromSearch.toFixed(1)} mi`}
          </span>
        )}
      </div>

      {/* Subtitle row */}
      <p className="mt-0.5 ml-4 text-xs text-gray-400 leading-tight">
        {project.category} · {project.phase}
      </p>
    </button>
  );
}
