import { useState } from 'react';
import type { ProjectPhase } from '../types/project';
import { createPinSvgString } from '../utils/markerColors';

const PHASES: ProjectPhase[] = ['Planning', 'Design', 'Construction', 'Complete', 'On Hold'];

export default function MapLegend() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="pointer-events-auto bg-white bg-opacity-90 rounded-full shadow px-2.5 py-1 text-xs text-gray-600 font-medium flex items-center gap-1.5 hover:bg-opacity-100 transition"
      >
        <span style={{ width: 10, height: 13, display: 'inline-block' }}
          dangerouslySetInnerHTML={{ __html: createPinSvgString('Planning', 10, 13) }}
        />
        Phase key
      </button>
    );
  }

  return (
    <div className="pointer-events-auto bg-white bg-opacity-90 rounded-xl shadow-lg px-3 py-2 text-xs leading-snug">
      <div className="flex items-center justify-between mb-1.5">
        <p className="font-semibold text-gray-700">Phase</p>
        <button
          onClick={() => setOpen(false)}
          className="ml-3 text-gray-400 hover:text-gray-700 leading-none text-base"
          aria-label="Close legend"
        >
          ×
        </button>
      </div>
      {PHASES.map(phase => (
        <div key={phase} className="flex items-center gap-2 mb-1">
          <span
            className="flex-none"
            style={{ width: 14, height: 18 }}
            dangerouslySetInnerHTML={{ __html: createPinSvgString(phase, 14, 18) }}
          />
          <span className="text-gray-600">{phase}</span>
        </div>
      ))}
    </div>
  );
}
