import { REPORT_TYPES } from '../types/report';
import type { Report } from '../types/report';
import { reportIconSvg } from '../utils/reportIcons';

interface Props {
  reports: Report[];
  likedIds: Set<string>;
  onLike: (id: string) => void;
  onLocate: (report: Report) => void;
  onClose: () => void;
}

function timeAgo(ts: number): string {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function PriorityList({ reports, likedIds, onLike, onLocate, onClose }: Props) {
  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[1100] flex items-end md:items-center md:justify-end"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      {/* Panel */}
      <div
        className="w-full md:w-96 md:h-full md:max-h-screen bg-white md:rounded-none
                   rounded-t-2xl shadow-2xl flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-none">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Community Reports</h2>
            <p className="text-xs text-gray-500">{reports.length} report{reports.length !== 1 ? 's' : ''} — sorted by upvotes</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1">
          {reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-2 opacity-40">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2"/>
                <path d="M20 12v10M20 28v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-sm">No reports yet</p>
              <p className="text-xs mt-1">Tap anywhere on the map to report an issue</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {reports.map(report => {
                const typeDef = REPORT_TYPES.find(t => t.id === report.typeId);
                if (!typeDef) return null;
                const alreadyLiked = likedIds.has(report.id);
                return (
                  <li key={report.id} className="flex items-center gap-3 px-4 py-3">
                    {/* Icon */}
                    <span
                      className="flex-none"
                      dangerouslySetInnerHTML={{ __html: reportIconSvg(report.typeId, 36, typeDef.color) }}
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{typeDef.label}</p>
                      <p className="text-xs text-gray-500">{timeAgo(report.createdAt)}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-none">
                      <button
                        onClick={() => onLocate(report)}
                        className="text-xs text-blue-600 hover:underline"
                        title="View on map"
                      >
                        Map
                      </button>
                      <button
                        onClick={() => onLike(report.id)}
                        disabled={alreadyLiked}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold transition-colors
                          ${alreadyLiked
                            ? 'bg-blue-100 text-blue-700 cursor-default'
                            : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700'
                          }`}
                        title={alreadyLiked ? 'Already upvoted' : 'Upvote'}
                      >
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M6 1l1.5 3H11L8.5 6.5l1 3L6 8 2.5 9.5l1-3L1 4h3.5z"
                            fill={alreadyLiked ? '#2563eb' : 'currentColor'}/>
                        </svg>
                        {report.likes}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
