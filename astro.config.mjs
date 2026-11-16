import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

// Pages stay prerendered (static); only src/pages/api/* runs on the Node server.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  session: false,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
});
