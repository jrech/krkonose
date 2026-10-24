// Browser side of the address lookup. It only talks to our own endpoints (never to a provider
// directly), so no API key ever reaches the page. With PUBLIC_ADDRESS_API_URL=off there is no client
// and the form falls back to manual verification.
import { coverageStatuses, type AddressSuggestion, type CoverageCheckResponse } from './types';

export interface AddressLookupClient {
  suggest(query: string, signal: AbortSignal): Promise<AddressSuggestion[]>;
  check(suggestionId: string, signal?: AbortSignal): Promise<CoverageCheckResponse>;
}

/** HTTP 429: too many requests from this visitor; `retryAfterMs` comes from the Retry-After header. */
export class RateLimitError extends Error {
  constructor(readonly retryAfterMs: number) { super('Address API rate limited'); }
}

const isString = (value: unknown): value is string => typeof value === 'string' && value.length > 0;

function parseSuggestions(data: unknown): AddressSuggestion[] {
  const list = (data as { suggestions?: unknown })?.suggestions;
  if (!Array.isArray(list)) throw new Error('Malformed suggestions');
  return list
    .filter((item): item is AddressSuggestion => isString(item?.id) && isString(item?.label))
    .map(({ id, label, detail }) => ({ id, label, detail: isString(detail) ? detail : undefined }));
}

// Anything that does not look exactly like a check result is rejected, so a broken or spoofed
// response can never surface as "available".
function parseCheck(data: unknown): CoverageCheckResponse {
  const { address, coverage } = (data ?? {}) as Partial<CoverageCheckResponse>;
  if (!address || !isString(address.label) || !Number.isFinite(address.lat) || !Number.isFinite(address.lng)) throw new Error('Malformed address');
  if (!coverage || !coverageStatuses.includes(coverage.status)) throw new Error('Malformed coverage');
  return { address, coverage };
}

export function createHttpLookupClient(baseUrl: string): AddressLookupClient {
  const base = baseUrl.replace(/\/$/, '');
  const request = async (path: string, init: RequestInit) => {
    const response = await fetch(`${base}${path}`, { ...init, headers: { accept: 'application/json', ...init.headers } });
    if (response.status === 429) {
      const seconds = Number(response.headers.get('retry-after'));
      throw new RateLimitError((Number.isFinite(seconds) && seconds > 0 ? Math.min(seconds, 120) : 30) * 1000);
    }
    if (!response.ok) throw new Error(`Address API ${response.status}`);
    return response.json();
  };
  return {
    suggest: async (query, signal) => parseSuggestions(await request(`/suggest/?q=${encodeURIComponent(query)}`, { signal })),
    check: async (id, signal) => parseCheck(await request('/check/', {
      method: 'POST', signal, body: JSON.stringify({ id }), headers: { 'content-type': 'application/json' },
    })),
  };
}

/**
 * Our own endpoint (src/pages/api/address/[action].ts) by default. PUBLIC_ADDRESS_API_URL overrides it;
 * set it to "off" to fall back to manual verification only.
 */
export function getLookupClient(): AddressLookupClient | null {
  const baseUrl = (import.meta.env.PUBLIC_ADDRESS_API_URL ?? '/api/address').trim();
  return baseUrl && baseUrl !== 'off' ? createHttpLookupClient(baseUrl) : null;
}
