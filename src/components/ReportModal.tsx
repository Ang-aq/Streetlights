import { REPORT_TYPES } from '../types/report';
import type { ReportTypeId } from '../types/report';
import { reportIconSvg } from '../utils/reportIcons';

interface Props {
  lat: number;
  lng: number;
  onSubmit: (typeId: ReportTypeId) => void;
  onCancel: () => void;
}

export default function ReportModal({ lat, lng, onSubmit, onCancel }: Props) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onCancel}
    >
      {/* Bottom sheet */}
      <div
        className="w-full max-w-lg bg-white rounded-t-2xl p-5 pb-8 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-300" />

        <h2 className="text-base font-semibold text-gray-900 mb-1">Report an Issue</h2>
        <p className="text-xs text-gray-500 mb-4">
          {lat.toFixed(5)}, {lng.toFixed(5)} &mdash; tap a category below
        </p>

        {/* 3×2 icon grid */}
        <div className="grid grid-cols-3 gap-3">
          {REPORT_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => onSubmit(type.id)}
              className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 p-3
                         hover:border-amber-400 hover:bg-amber-50 active:scale-95
                         transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: reportIconSvg(type.id, 40, type.color),
                }}
              />
              <span className="text-[11px] font-medium text-gray-700 text-center leading-tight">
                {type.label}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={onCancel}
          className="mt-5 w-full py-2 rounded-lg text-sm text-gray-500 hover:text-gray-800
                     hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
