// Address lookup endpoints for the Svozová oblast form (runs on Cloudflare Workers, not prerendered).
// GET /api/address/suggest/?q=…  → suggestions;  POST /api/address/check/ { id } → coverage (trailingSlash: always).
// MAPY_API_KEY is a Worker secret (Cloudflare dashboard, or .dev.vars locally); never PUBLIC_.
import type { APIRoute } from 'astro';
import { env } from 'cloudflare:workers';
import { createAddressApi } from '../../../lib/address/server';
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

const notFound = () => new Response(null, { status: 404 });

export const GET: APIRoute = ({ params, request }) => params.action === 'suggest' ? getApi().suggest(request) : notFound();
export const POST: APIRoute = ({ params, request }) => params.action === 'check' ? getApi().check(request) : notFound();
