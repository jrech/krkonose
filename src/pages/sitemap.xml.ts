import type { APIRoute } from 'astro';
// /llm-info/ is listed here and in /llms.txt so AI crawlers find it, though no menu links to it.
const pages = ['/', '/kontakt/', '/llm-info/', '/ochrana-osobnich-udaju/', '/cookies/'];
export const GET: APIRoute = ({ site }) => new Response(
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${site ? pages.map(page => `<url><loc>${new URL(page, site).href.replace(/&/g, '&amp;')}</loc></url>`).join('') : ''}</urlset>`,
  { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
);
