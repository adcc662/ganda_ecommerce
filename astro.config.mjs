// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  // @astrojs/node provides filesystem session storage. The cookie defaults to
  // httpOnly, SameSite=Lax and Secure in production; the TTL matches the API's
  // 24h JWT expiry (jwt.expiration) so the session never outlives its token.
  session: { ttl: 60 * 60 * 24 },
  server: { port: 3000 },
  devToolbar: { enabled: false },
});
