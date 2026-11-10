// Address lookup endpoints for the Svozová oblast form (runs on Node, not prerendered).
// GET /api/address/suggest/?q=…  → suggestions;  POST /api/address/check/ { id } → coverage (trailingSlash: always).
// MAPY_API_KEY is a server-side Zerops secret; never PUBLIC_.
import type { APIRoute } from 'astro';
import { createAddressApi, RETRY_AFTER_SECONDS } from '../../../lib/address/server';
import { mapyComProvider } from '../../../lib/address/providers/mapy-com';
import { serviceAreaChecker } from '../../../lib/coverage/check';
import { serviceArea } from '../../../data/service-area';

export const prerender = false;

let api: ReturnType<typeof createAddressApi> | undefined;
function getApi() {
  if (!api) {
    const provider = mapyComProvider(process.env.MAPY_API_KEY ?? '', serviceArea.searchArea);
    api = createAddressApi({ autocomplete: provider, resolver: provider, checker: serviceAreaChecker(serviceArea) });
  }
  return api;
}

const reply = (status: number, error?: string, headers: HeadersInit = {}) => new Response(error ? JSON.stringify({ error }) : null, {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});

const WINDOW_MS = 60_000;
const PER_IP_LIMIT = 20;
const GLOBAL_LIMIT = 120;
const windows = new Map<string, { count: number; resetAt: number }>();

/** Limit calls before Mapy.com. A global limit also bounds costs if an IP header is spoofed. */
function rateLimited(request: Request) {
  if (!process.env.MAPY_API_KEY) return reply(503, 'unavailable');
  const now = Date.now();
  if (windows.size > 10_000) {
    for (const [key, value] of windows) if (value.resetAt <= now) windows.delete(key);
  }
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',').at(-1)?.trim() || 'unknown';
  for (const [key, limit] of [['global', GLOBAL_LIMIT], [`ip:${ip}`, PER_IP_LIMIT]] as const) {
    const window = windows.get(key);
    if (window && window.resetAt > now && window.count >= limit) {
      return reply(429, 'rate_limited', { 'retry-after': String(RETRY_AFTER_SECONDS) });
    }
  }
  for (const key of ['global', `ip:${ip}`]) {
    const window = windows.get(key);
    windows.set(key, window && window.resetAt > now
      ? { count: window.count + 1, resetAt: window.resetAt }
      : { count: 1, resetAt: now + WINDOW_MS });
  }
  return null;
}

export const GET: APIRoute = async ({ params, request }) =>
  params.action === 'suggest' ? rateLimited(request) ?? getApi().suggest(request) : reply(404);
export const POST: APIRoute = async ({ params, request }) =>
  params.action === 'check' ? rateLimited(request) ?? getApi().check(request) : reply(404);
