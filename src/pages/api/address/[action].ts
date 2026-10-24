// Address lookup endpoints for the Svozová oblast form (runs on Cloudflare Workers, not prerendered).
// GET /api/address/suggest/?q=…  → suggestions;  POST /api/address/check/ { id } → coverage (trailingSlash: always).
// MAPY_API_KEY is a Worker secret (Cloudflare dashboard, or .dev.vars locally); never PUBLIC_.
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createAddressApi, RETRY_AFTER_SECONDS } from '../../../lib/address/server';
import { mapyComProvider } from '../../../lib/address/providers/mapy-com';
import { serviceAreaChecker } from '../../../lib/coverage/check';
import { serviceArea } from '../../../data/service-area';

export const prerender = false;

let api: ReturnType<typeof createAddressApi> | undefined;
function getApi() {
  if (!api) {
    const provider = mapyComProvider(env.MAPY_API_KEY ?? '');
    api = createAddressApi({ autocomplete: provider, resolver: provider, checker: serviceAreaChecker(serviceArea) });
  }
  return api;
}

const reply = (status: number, error?: string, headers: HeadersInit = {}) => new Response(error ? JSON.stringify({ error }) : null, {
  status,
  headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers },
});

/**
 * Per-IP limit, enforced before Mapy.com is called. Without the binding only `astro dev` goes on;
 * a deployed Worker refuses to serve unprotected.
 */
async function rateLimited(request: Request) {
  const limiter = env.ADDRESS_LIMITER;
  if (!limiter) return import.meta.env.DEV ? null : reply(503, 'unavailable');
  const key = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const { success } = await limiter.limit({ key });
  return success ? null : reply(429, 'rate_limited', { 'retry-after': String(RETRY_AFTER_SECONDS) });
}

export const GET: APIRoute = async ({ params, request }) =>
  params.action === 'suggest' ? await rateLimited(request) ?? getApi().suggest(request) : reply(404);
export const POST: APIRoute = async ({ params, request }) =>
  params.action === 'check' ? await rateLimited(request) ?? getApi().check(request) : reply(404);
