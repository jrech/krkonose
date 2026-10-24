import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

// Set SITE_URL only after the production domain and business content are approved.
// Pages stay prerendered (static); only src/pages/api/* runs as a Cloudflare Worker.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  output: 'static',
  adapter: cloudflare({ imageService: 'compile' }),
  // No sessions: otherwise the adapter provisions a SESSION KV namespace on deploy.
  session: false,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
