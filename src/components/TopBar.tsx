import { useState, useRef, useEffect, type RefObject, type FormEvent } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { SearchLocation } from '../App';
import type { CIPProject, ProjectCategory } from '../types/project';
import { useNominatim } from '../hooks/useNominatim';

const ALL_CATEGORIES: ProjectCategory[] = [
  'Roads & Bridges', 'Utilities', 'Parks & Recreation',
  'Public Safety', 'Schools', 'Facilities', 'Other',
];

const SAMPLE_ADDRESSES = ['25 W Main St', '2501 Monument Ave', 'Hull Street'];

function formatRadius(r: number): string {
  if (r === 0.25) return '¼ mi';
  if (r === 0.5)  return '½ mi';
  return `${r} mi`;
}

interface Props {
  searchLocation: SearchLocation | null;
  onSearch: (loc: SearchLocation) => void;
  onClearSearch: () => void;
  mapRef: RefObject<LeafletMap | null>;
  allProjects: CIPProject[];
  activeCategories: Set<ProjectCategory>;
  onToggleCategory: (cat: ProjectCategory) => void;
  onClearCategories: () => void;
  radiusMiles: number;
  radiusOptions: number[];
  onRadiusChange: (r: number) => void;
  nearbyCount: number | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function TopBar({
  searchLocation, onSearch, onClearSearch, mapRef,
  allProjects, activeCategories, onToggleCategory, onClearCategories,
  radiusMiles, radiusOptions, onRadiusChange, nearbyCount,
  sidebarOpen, onToggleSidebar,
}: Props) {
  const [query, setQuery]           = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showInfo, setShowInfo]     = useState(false);
  const { geocode, loading, error } = useNominatim();
  const filtersRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!showFilters) return;
    const handler = (e: MouseEvent) => {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setShowFilters(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showFilters]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const loc = await geocode(query);
    if (loc) {
      onSearch(loc);
      mapRef.current?.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
    }
  };

  const handleSample = async (addr: string) => {
    setQuery(addr);
    const loc = await geocode(addr);
    if (loc) {
      onSearch(loc);
      mapRef.current?.flyTo([loc.lat, loc.lng], 14, { duration: 0.8 });
    }
  };

  const handleClear = () => {
    setQuery('');
    onClearSearch();
  };

  const counts = ALL_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = allProjects.filter(p => p.category === cat).length;
    return acc;
  }, {});

  return (
    <div className="flex-none bg-white border-b border-gray-200 shadow-sm z-10">

      {/* ── Main row ── */}
      <div className="flex items-center gap-2 px-3 py-2">

        {/* Logo */}
        <div className="flex items-center gap-1.5 flex-none select-none">
          <svg width="20" height="28" viewBox="0 0 32 42" fill="none" aria-hidden="true">
            <circle cx="27" cy="11" r="8" fill="#fbbf24" opacity="0.18"/>
            <rect x="14" y="18" width="4" height="24" rx="2" fill="#0f172a"/>
            <path d="M16 18 Q16 6 26 6" stroke="#0f172a" strokeWidth="3" strokeLinecap="round"/>
            <rect x="21" y="3" width="11" height="6" rx="2.5" fill="#0f172a"/>
            <ellipse cx="26.5" cy="10" rx="4" ry="2.2" fill="#fbbf24" opacity="0.95"/>
          </svg>
          <span className="font-brand font-bold text-base leading-none tracking-tight hidden sm:block">
            <span className="text-slate-900">Street</span><span className="text-amber-500">Lights</span>
          </span>
        </div>

        {/* Search form */}
        <form onSubmit={handleSubmit} className="flex flex-1 gap-1.5 min-w-0">
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Enter a Richmond, VA address…"
              className="w-full border border-gray-300 rounded-lg px-3 py-1.5 text-sm pr-6
                         focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-base leading-none"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex-none px-3 py-1.5 bg-slate-800 hover:bg-slate-700
                       disabled:bg-slate-400 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {loading ? '…' : 'Search'}
          </button>
        </form>

        {/* Right controls */}
        <div className="flex items-center gap-1 flex-none">

          {/* Filters */}
          <div className="relative" ref={filtersRef}>
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                activeCategories.size > 0
                  ? 'bg-slate-800 border-slate-800 text-white'
                  : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                <path d="M1 1.5h11M3 5.5h7M5 9.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="hidden sm:inline">Filters</span>
              {activeCategories.size > 0 && (
                <span className="bg-amber-400 text-slate-900 rounded-full text-[10px] font-bold w-4 h-4 flex items-center justify-center leading-none">
                  {activeCategories.size}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 top-full mt-1.5 z-[600] bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-64">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold text-gray-700">Filter by category</span>
                  {activeCategories.size > 0 && (
                    <button
                      onClick={() => { onClearCategories(); setShowFilters(false); }}
                      className="text-xs text-slate-600 hover:text-slate-900 underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
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
                </div>
              </div>
            )}
          </div>

          {/* List toggle */}
          <button
            onClick={onToggleSidebar}
            title={sidebarOpen ? 'Hide list' : 'Show list'}
            className={`p-1.5 rounded-lg border text-sm transition-colors ${
              sidebarOpen
                ? 'bg-slate-800 border-slate-800 text-white'
                : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="2.5" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="1" y="7.25" width="14" height="1.5" rx="0.75" fill="currentColor"/>
              <rect x="1" y="12" width="9"  height="1.5" rx="0.75" fill="currentColor"/>
            </svg>
          </button>

          {/* Info */}
          <button
            onClick={() => setShowInfo(true)}
            title="About StreetLights"
            className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M8 7.5v4M8 5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* GitHub */}
          <a
            href="https://github.com/Ang-aq/Streetlights"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            className="p-1.5 rounded-lg border border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-50 transition-colors hidden sm:flex"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── Secondary row: radius (after search) or sample addresses (before) ── */}
      {searchLocation ? (
        <div className="flex flex-wrap items-center gap-2 px-3 pb-2 text-xs text-gray-500">
          <span>
            {nearbyCount !== null
              ? `${nearbyCount} project${nearbyCount !== 1 ? 's' : ''} within`
              : 'Radius:'}
          </span>
          <div className="flex gap-1">
            {radiusOptions.map(r => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`px-2 py-0.5 rounded-full border text-xs font-medium transition-colors ${
                  r === radiusMiles
                    ? 'bg-slate-800 border-slate-800 text-white'
                    : 'border-gray-300 text-gray-500 hover:border-slate-500'
                }`}
              >
                {formatRadius(r)}
              </button>
            ))}
          </div>
          <span className="text-gray-400 truncate" title={searchLocation.displayName}>
            near {searchLocation.displayName.split(',').slice(0, 2).join(',')}
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400 px-3 pb-2">
          <span>Try:</span>
          {SAMPLE_ADDRESSES.map(addr => (
            <button
              key={addr}
              onClick={() => handleSample(addr)}
              className="underline hover:text-slate-700 transition-colors"
            >
              {addr}
            </button>
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-xs px-3 pb-2">{error}</p>}

      {/* ── Info modal ── */}
      {showInfo && (
        <div
          className="fixed inset-0 z-[700] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-3">
              <svg width="22" height="30" viewBox="0 0 32 42" fill="none" aria-hidden="true">
                <rect x="14" y="18" width="4" height="24" rx="2" fill="#0f172a"/>
                <path d="M16 18 Q16 6 26 6" stroke="#0f172a" strokeWidth="3" strokeLinecap="round"/>
                <rect x="21" y="3" width="11" height="6" rx="2.5" fill="#0f172a"/>
                <ellipse cx="26.5" cy="10" rx="4" ry="2.2" fill="#fbbf24" opacity="0.95"/>
              </svg>
              <h2 className="font-brand font-bold text-lg">
                <span className="text-slate-900">Street</span><span className="text-amber-500">Lights</span>
              </h2>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              A civic hackathon prototype built for the Richmond Civic Hackathon (March 2026),
              targeting Pillar 6 — Transportation Project Visibility. Helps residents discover
              and report City of Richmond infrastructure projects near them.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed border-t border-gray-100 pt-3">
              <strong>Prototype notice:</strong> Project data is sourced from the City of Richmond
              CIP Dashboard and may not reflect the most current information. Locations are approximate.
            </p>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
