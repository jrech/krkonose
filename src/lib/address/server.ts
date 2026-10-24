// Server-side address API, framework-agnostic (Request → Response). Runs as a Cloudflare Worker via
// src/pages/api/address/[action].ts; rate limiting happens there, before any of this is called.
// Provider API keys must only ever be read here (non-PUBLIC env vars), never in browser code.
import type { AddressSuggestion, CoverageCheckResponse, ResolvedAddress } from './types';
import type { CoverageChecker } from '../coverage/check';

export interface LookupOptions { signal?: AbortSignal; limit: number }

/** Query → suggestions. Implementations must restrict results to Czech addresses (country = cz). */
export interface AddressAutocompleteProvider {
  suggest(query: string, options: LookupOptions): Promise<AddressSuggestion[]>;
}

/** Suggestion id → coordinates and normalised address. Return null when the id cannot be resolved. */
export interface AddressResolutionProvider {
  resolve(id: string, options: { signal?: AbortSignal }): Promise<ResolvedAddress | null>;
}

export interface AddressApiDeps {
  autocomplete: AddressAutocompleteProvider;
  resolver: AddressResolutionProvider;
  checker: CoverageChecker;
}

const MAX_QUERY = 120;
const MIN_QUERY = 3;
const MAX_ID = 512;
const SUGGESTION_LIMIT = 5;
const UPSTREAM_TIMEOUT_MS = 3000;
export const RETRY_AFTER_SECONDS = 30;
// Generous box around Czechia; coordinates outside it are treated as a provider error.
const CZ_BOUNDS = { south: 48.4, north: 51.2, west: 12, east: 19 };

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

/** Aborts the provider call when the visitor cancels or the provider is too slow. */
const withTimeout = (signal: AbortSignal) => AbortSignal.any([signal, AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)]);

export function cleanQuery(value: unknown) {
  if (typeof value !== 'string') return null;
  const query = value.replace(/\s+/g, ' ').replace(/[\u0000-\u001f\u007f]/g, '').trim();
  return query.length >= MIN_QUERY && query.length <= MAX_QUERY ? query : null;
}

function isCzech(address: ResolvedAddress) {
  return address.countryCode === 'cz'
    && address.lat >= CZ_BOUNDS.south && address.lat <= CZ_BOUNDS.north
    && address.lng >= CZ_BOUNDS.west && address.lng <= CZ_BOUNDS.east;
}

export function createAddressApi({ autocomplete, resolver, checker }: AddressApiDeps) {
  return {
    /** GET ?q=… → { suggestions } */
    async suggest(request: Request) {
      const query = cleanQuery(new URL(request.url).searchParams.get('q'));
      if (!query) return json({ error: 'invalid_query' }, 400);
      try {
        const suggestions = await autocomplete.suggest(query, { signal: withTimeout(request.signal), limit: SUGGESTION_LIMIT });
        return json({ suggestions: suggestions.slice(0, SUGGESTION_LIMIT) });
      } catch (error) {
        console.error('[address] suggest failed', error);
        return json({ error: 'provider_failed' }, 502);
      }
    },
    /** POST { id } → CoverageCheckResponse */
    async check(request: Request) {
      const body = await request.json().catch(() => null) as { id?: unknown } | null;
      const id = typeof body?.id === 'string' ? body.id.trim() : '';
      if (!id || id.length > MAX_ID) return json({ error: 'invalid_id' }, 400);
      try {
        const address = await resolver.resolve(id, { signal: withTimeout(request.signal) });
        if (!address) return json({ error: 'not_found' }, 404);
        if (!isCzech(address)) return json({ error: 'outside_country' }, 422);
        const response: CoverageCheckResponse = { address, coverage: await checker.check(address) };
        return json(response);
      } catch (error) {
        console.error('[address] check failed', error);
        return json({ error: 'provider_failed' }, 502);
      }
    },
  };
}
