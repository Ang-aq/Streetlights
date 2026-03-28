import type { CIPProject } from '../types/project';
import { phaseToColor } from '../utils/markerColors';
import { formatCost, percentSpent } from '../utils/plainLanguage';

interface Props {
  project: CIPProject;
  onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: Props) {
  const phaseColor = phaseToColor(project.phase);
  const pct = percentSpent(project.spentToDate, project.totalBudget);

  return (
    /* Slide-in overlay from bottom on mobile, right side on desktop */
    <div className="fixed inset-0 z-[1000] flex items-end md:items-stretch md:justify-end pointer-events-none">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black bg-opacity-30 pointer-events-auto"
        onClick={onClose}
        aria-label="Close detail panel"
      />

      {/* Panel */}
      <div className="relative pointer-events-auto w-full md:w-96 bg-white shadow-xl flex flex-col max-h-[80vh] md:max-h-full overflow-hidden rounded-t-2xl md:rounded-none">
        {/* Header */}
        <div className="flex-none px-4 pt-4 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs px-2 py-0.5 rounded font-semibold text-white"
                  style={{ background: phaseColor }}
                >
                  {project.phase}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                  {project.category}
                </span>
              </div>
              <h2 className="text-base font-bold text-gray-900 leading-tight">{project.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="flex-none text-gray-400 hover:text-gray-700 text-2xl leading-none"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Location */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Location</p>
            <p className="text-sm text-gray-700">{project.location}</p>
          </div>

          {/* Plain summary */}
          <div className="bg-blue-50 rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-blue-600 mb-0.5">What this means for residents</p>
            <p className="text-sm text-blue-900 leading-snug">{project.plainSummary}</p>
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
              <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Budget */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Budget</p>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Spent: <strong>{formatCost(project.spentToDate)}</strong></span>
              <span>Total: <strong>{formatCost(project.totalBudget)}</strong></span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${pct}%`, background: phaseColor }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-0.5 text-right">{pct}% spent</p>
          </div>

          {/* Completion */}
          <div className="flex gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Est. Completion</p>
              <p className="text-sm text-gray-700">{project.estimatedCompletion || 'Unknown'}</p>
            </div>
            {project.distanceFromSearch !== undefined && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Distance</p>
                <p className="text-sm text-gray-700">
                  {project.distanceFromSearch < 0.1
                    ? '<0.1 miles away'
                    : `${project.distanceFromSearch.toFixed(2)} miles away`}
                </p>
              </div>
            )}
          </div>

          {/* SMS CTA — prototype only */}
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <p className="text-xs font-semibold text-green-700 mb-0.5">Get project updates</p>
            <p className="text-sm text-green-800 leading-snug">
              Text <strong>RICHMOND-{project.id.replace('CIP-', '')}</strong> to{' '}
              <strong>(804) 555-0130</strong> to receive updates about this project.{' '}
              <em className="text-xs text-green-600">(Prototype: SMS not yet active)</em>
            </p>
          </div>

          {/* Project manager */}
          {(project.manager || project.email || project.phone) && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Project Manager</p>
              <div className="space-y-0.5 text-sm text-gray-700">
                {project.manager && <p className="font-medium">{project.manager}</p>}
                {project.email && (
                  <a href={`mailto:${project.email}`} className="block text-blue-600 hover:underline text-xs">
                    {project.email}
                  </a>
                )}
                {project.phone && (
                  <a href={`tel:${project.phone}`} className="block text-blue-600 hover:underline text-xs">
                    {project.phone}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Data notice */}
          <p className="text-xs text-gray-400 leading-snug">
            Data sourced from the City of Richmond CIP Dashboard. Project locations are approximate.
            For official information visit the City of Richmond website.
          </p>
        </div>
      </div>
    </div>
  );
}
