import { useEffect, useRef } from 'react';
import type { CIPProject, ProjectCategory } from '../types/project';
import ProjectCard from './ProjectCard';

const ALL_CATEGORIES: ProjectCategory[] = [
  'Roads & Bridges', 'Utilities', 'Parks & Recreation',
  'Public Safety', 'Schools', 'Facilities', 'Other',
];

interface Props {
  projects: CIPProject[];
  allProjects: CIPProject[];
  selectedProject: CIPProject | null;
  searchActive: boolean;
  activeCategories: Set<ProjectCategory>;
  onToggleCategory: (cat: ProjectCategory) => void;
  onClearCategories: () => void;
  onSelect: (project: CIPProject) => void;
  onClose?: () => void;
}

export default function ProjectList({
  projects, allProjects, selectedProject, searchActive,
  activeCategories, onToggleCategory, onClearCategories,
  onSelect, onClose,
}: Props) {
  const counts = ALL_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = allProjects.filter(p => p.category === cat).length;
    return acc;
  }, {});

  const hasActiveFilter = activeCategories.size > 0;

  // Track the previous selected project id so we don't re-flash on every render
  const prevSelectedIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedProject) {
      prevSelectedIdRef.current = null;
      return;
    }
    if (selectedProject.id === prevSelectedIdRef.current) return;
    prevSelectedIdRef.current = selectedProject.id;

    const card = document.querySelector<HTMLElement>(`[data-project-id="${selectedProject.id}"]`);
    if (!card) return;

    // Scroll into view
    card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Amber flash
    card.classList.add('card-flash');
    const timer = setTimeout(() => card.classList.remove('card-flash'), 500);
    return () => clearTimeout(timer);
  }, [selectedProject]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {searchActive
            ? `${projects.length} nearby project${projects.length !== 1 ? 's' : ''}`
            : `All projects (${projects.length})`}
        </p>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-lg leading-none ml-2"
            aria-label="Close list"
          >
            ×
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex-none px-3 py-2 border-b border-gray-100 bg-white">
        <div className="flex flex-wrap gap-1.5">
          {ALL_CATEGORIES.filter(cat => counts[cat] > 0).map(cat => {
            const active = activeCategories.has(cat);
            return (
              <button
                key={cat}
                onClick={() => onToggleCategory(cat)}
                className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors ${
                  active
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'border-gray-300 text-gray-600 hover:border-slate-500 hover:bg-gray-50'
                }`}
              >
                {cat} <span className={active ? 'opacity-60' : 'text-gray-400'}>{counts[cat]}</span>
              </button>
            );
          })}
          {hasActiveFilter && (
            <button
              onClick={onClearCategories}
              className="text-xs px-2 py-0.5 rounded-full border border-transparent text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Clear
            </button>
          )}
        </div>
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
