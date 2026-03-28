import { useState, useCallback } from 'react';
import type { SearchLocation } from '../App';

// Richmond, VA bounding box for viewbox parameter
const RICHMOND_VIEWBOX = '-77.6,37.45,-77.3,37.6';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface UseNominatimReturn {
  geocode: (query: string) => Promise<SearchLocation | null>;
  loading: boolean;
  error: string | null;
}

export function useNominatim(): UseNominatimReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocode = useCallback(async (query: string): Promise<SearchLocation | null> => {
    if (!query.trim()) return null;

    setLoading(true);
    setError(null);

    // Append Richmond, VA to bias results locally
    const fullQuery = query.toLowerCase().includes('richmond')
      ? query
      : `${query.trim()}, Richmond, VA`;

    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', fullQuery);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('viewbox', RICHMOND_VIEWBOX);
    url.searchParams.set('bounded', '0'); // fall back outside viewbox if needed
    url.searchParams.set('countrycodes', 'us');

    try {
      const res = await fetch(url.toString(), {
        headers: { 'Accept-Language': 'en' },
      });

      if (!res.ok) {
        throw new Error(`Nominatim error: ${res.status}`);
      }

      const data: NominatimResult[] = await res.json();

      if (!data.length) {
        setError('Address not found. Try a more specific address in Richmond, VA.');
        return null;
      }

      const { lat, lon, display_name } = data[0];
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        displayName: display_name,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not geocode address: ${msg}`);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { geocode, loading, error };
}
