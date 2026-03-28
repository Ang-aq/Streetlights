import type { ProjectPhase } from '../types/project';
import { phaseToColor } from '../utils/markerColors';

const PHASES: ProjectPhase[] = ['Planning', 'Design', 'Construction', 'Complete', 'On Hold', 'Unknown'];

export default function MapLegend() {
  return (
    <div className="bg-white bg-opacity-90 rounded shadow px-3 py-2 text-xs leading-snug">
      <p className="font-semibold text-gray-700 mb-1">Phase</p>
      {PHASES.map(phase => (
        <div key={phase} className="flex items-center gap-1.5 mb-0.5">
          <span
            className="inline-block rounded-full border-2 border-white shadow-sm flex-none"
            style={{ width: 12, height: 12, background: phaseToColor(phase) }}
          />
          <span className="text-gray-600">{phase}</span>
        </div>
      ))}
    </div>
  );
}
