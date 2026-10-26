// Production entry (npm start). Wraps the Astro Node handler so every response, prerendered pages
// included, carries the security headers. public/_headers only works on Cloudflare/Netlify, not here.
// HSTS is left to the Zerops L7 balancer, which already sends it for the live domain.
import http from 'node:http';

process.env.ASTRO_NODE_AUTOSTART = 'disabled';
const { handler } = await import('./dist/server/entry.mjs');

// Third parties: GA4 (only after analytics consent), Formspree (inquiry form), Google Maps embed
// on /kontakt/ (only after maps consent). Mapy.com is called server-side, so it needs no entry here.
// 'unsafe-inline' scripts: Astro inlines small page scripts and the motion bootstrap in BaseLayout.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com",
  "connect-src 'self' https://formspree.io https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.google.com",
  "font-src 'self'",
  'frame-src https://maps.google.com https://www.google.com',
  "frame-ancestors 'none'",
  "form-action 'self' https://formspree.io",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const securityHeaders = {
  'Content-Security-Policy': csp,
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

const port = Number(process.env.PORT ?? 8080);
const host = process.env.HOST ?? 'localhost';

http.createServer((req, res) => {
  for (const [name, value] of Object.entries(securityHeaders)) res.setHeader(name, value);
  handler(req, res);
}).listen(port, host, () => console.log(`Listening on http://${host}:${port}`));
