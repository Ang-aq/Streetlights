import type { ProjectPhase } from '../types/project';
import { createPinSvgString } from '../utils/markerColors';

const PHASES: ProjectPhase[] = ['Planning', 'Design', 'Construction', 'Complete', 'On Hold'];

export default function MapLegend() {
  return (
    <div className="bg-white bg-opacity-90 rounded shadow px-3 py-2 text-xs leading-snug">
      <p className="font-semibold text-gray-700 mb-1.5">Phase</p>
      {PHASES.map(phase => (
        <div key={phase} className="flex items-center gap-2 mb-1">
          <span
            className="flex-none"
            style={{ width: 16, height: 20 }}
            dangerouslySetInnerHTML={{ __html: createPinSvgString(phase, 16, 20) }}
          />
          <span className="text-gray-600">{phase}</span>
        </div>
      ))}
    </div>
  );
}
