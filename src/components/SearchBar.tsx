import { useState, type RefObject, type FormEvent } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import type { SearchLocation } from '../App';
import { useNominatim } from '../hooks/useNominatim';

const SAMPLE_ADDRESSES = [
  '25 W Main St',
  '2501 Monument Ave',
  'Hull Street',
];

interface Props {
  onSearch: (loc: SearchLocation) => void;
  mapRef: RefObject<LeafletMap | null>;
  searchLocation: SearchLocation | null;
  radiusMiles: number;
  onRadiusChange: (r: number) => void;
  radiusOptions: number[];
  nearbyCount: number | null;
}

export default function SearchBar({
  onSearch,
  mapRef,
  searchLocation,
  radiusMiles,
  onRadiusChange,
  radiusOptions,
  nearbyCount,
}: Props) {
  const [query, setQuery] = useState('');
  const { geocode, loading, error } = useNominatim();

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

  return (
    <div className="space-y-1.5">
      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter your address in Richmond, VA…"
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded text-sm font-medium flex items-center gap-1.5 transition-colors"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Searching…
            </>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Error */}
      {error && (
        <p className="text-red-600 text-xs">{error}</p>
      )}

      {/* Results + radius row */}
      {searchLocation ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
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
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'border-gray-300 text-gray-500 hover:border-blue-400'
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>
          <span className="text-gray-400 truncate max-w-[200px]" title={searchLocation.displayName}>
            near {searchLocation.displayName.split(',').slice(0, 2).join(',')}
          </span>
        </div>
      ) : (
        /* Sample addresses */
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-400">
          <span>Try:</span>
          {SAMPLE_ADDRESSES.map(addr => (
            <button
              key={addr}
              onClick={() => handleSample(addr)}
              className="underline hover:text-blue-600 transition-colors"
            >
              {addr}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
