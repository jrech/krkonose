// Mapy.com (Seznam) REST API as the address provider: https://developer.mapy.com/rest-api/
// Server-only: the API key must never reach browser code.
//
// Suggestions already carry coordinates, but the browser only gets an opaque id (query + name +
// location). `resolve` repeats the same suggest call on the server and accepts only an exact match,
// so a visitor can never send their own coordinates to the coverage check. (Re-geocoding the label
// is not reliable: /v1/geocode can return a neighbouring house.)
import type { AddressSuggestion, ResolvedAddress } from '../types';
import type { AddressAutocompleteProvider, AddressResolutionProvider, LookupOptions } from '../server';

const API = 'https://api.mapy.cz/v1/suggest';
// Bias results towards Krkonoše; anything in Czechia can still be found.
const PREFER_NEAR = '15.61,50.63';

interface MapyItem {
  name: string;
  location?: string;
  type: string;
  position?: { lon: number; lat: number };
  zip?: string;
  regionalStructure?: { name: string; type: string; isoCode?: string }[];
}

interface SuggestionKey { q: string; name: string; location: string }

const encodeId = (key: SuggestionKey) => JSON.stringify(key);
function decodeId(id: string): SuggestionKey | null {
  try {
    const key = JSON.parse(id) as Partial<SuggestionKey>;
    return typeof key.q === 'string' && typeof key.name === 'string' && typeof key.location === 'string' ? key as SuggestionKey : null;
  } catch {
    return null;
  }
}

export function mapyComProvider(apiKey: string): AddressAutocompleteProvider & AddressResolutionProvider {
  if (!apiKey) throw new Error('MAPY_API_KEY is not set');

  async function suggest(query: string, { limit, signal }: LookupOptions): Promise<MapyItem[]> {
    const params = new URLSearchParams({
      query, lang: 'cs', limit: String(limit), type: 'regional.address', locality: 'cz',
      preferNear: PREFER_NEAR, preferNearPrecision: '20000', apikey: apiKey,
    });
    const response = await fetch(`${API}?${params}`, { signal, headers: { accept: 'application/json' } });
    if (!response.ok) throw new Error(`Mapy.com ${response.status}`);
    const data = await response.json() as { items?: MapyItem[] };
    return (data.items ?? []).filter(item => item.type === 'regional.address' && item.position);
  }

  return {
    async suggest(query, options): Promise<AddressSuggestion[]> {
      return (await suggest(query, options)).map(item => ({
        id: encodeId({ q: query, name: item.name, location: item.location ?? '' }),
        label: item.name,
        detail: [item.location?.replace(/, Česko$/, ''), item.zip].filter(Boolean).join(' · ') || undefined,
      }));
    },

    async resolve(id, { signal }): Promise<ResolvedAddress | null> {
      const key = decodeId(id);
      if (!key) return null;
      const item = (await suggest(key.q, { limit: 10, signal })).find(entry => entry.name === key.name && (entry.location ?? '') === key.location);
      if (!item?.position) return null;
      const region = item.regionalStructure ?? [];
      const country = region.find(part => part.type === 'regional.country')?.isoCode?.toLowerCase() ?? '';
      return {
        label: [item.name, item.location?.replace(/, Česko$/, '')].filter(Boolean).join(', '),
        lat: item.position.lat,
        lng: item.position.lon,
        postcode: item.zip,
        municipality: region.find(part => part.type === 'regional.municipality')?.name,
        countryCode: country,
      };
    },
  };
}
