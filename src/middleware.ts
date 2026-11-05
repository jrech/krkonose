import { defineMiddleware } from 'astro:middleware';
import { noOrphansHtml } from './lib/typography';

// Every HTML page (dev, prerendered build and server) gets non-breaking spaces after one-letter words
// and inside numbers, so no line ends with a hanging "v" or "a" (lib/typography.ts). Other responses pass.
export const onRequest = defineMiddleware(async (_context, next) => {
  const response = await next();
  if (!response.headers.get('content-type')?.includes('text/html')) return response;
  const html = await response.text();
  return new Response(noOrphansHtml(html), { status: response.status, statusText: response.statusText, headers: response.headers });
});
