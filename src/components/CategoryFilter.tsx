import type { CIPProject, ProjectCategory } from '../types/project';

interface Props {
  projects: CIPProject[];
  activeCategories: Set<ProjectCategory>;
  onToggle: (category: ProjectCategory) => void;
  onClear: () => void;
}

// Derive ordered unique categories from the full project list
const ALL_CATEGORIES: ProjectCategory[] = [
  'Roads & Bridges',
  'Utilities',
  'Parks & Recreation',
  'Public Safety',
  'Schools',
  'Facilities',
  'Other',
];

export default function CategoryFilter({ projects, activeCategories, onToggle, onClear }: Props) {
  // Count per category
  const counts = ALL_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = projects.filter(p => p.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {activeCategories.size > 0 && (
        <button
          onClick={onClear}
          className="text-xs px-2 py-0.5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-medium transition-colors"
        >
          All
        </button>
      )}
      {ALL_CATEGORIES.filter(cat => counts[cat] > 0).map(cat => {
        const active = activeCategories.has(cat);
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-colors whitespace-nowrap ${
              active
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {cat}
            <span className={`ml-1 ${active ? 'text-blue-200' : 'text-gray-400'}`}>
              {counts[cat]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
