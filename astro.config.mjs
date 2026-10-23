import { defineConfig } from 'astro/config';

// Set SITE_URL only after the production domain and business content are approved.
export default defineConfig({
  site: process.env.SITE_URL || undefined,
  output: 'static',
  // 'ignore' so /kontakt and /kontakt/ both work; the build still emits /kontakt/index.html and links use the slash.
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
});
