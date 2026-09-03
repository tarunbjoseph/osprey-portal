// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

/**
 * Deploy targets
 * -------------------------------------------------------------------------
 * GitHub Pages (project site):  SITE=https://<user>.github.io  BASE=/<repo>
 * GitHub Pages (user site):     SITE=https://<user>.github.io  BASE=/
 * Custom domain / Cloudflare:   SITE=https://osprey.example    BASE=/
 *
 * The workflow in .github/workflows/deploy.yml sets these automatically for
 * GitHub Pages. Override locally with a .env file if you need to.
 */
const SITE = process.env.SITE ?? 'https://tarunbjoseph.github.io';
const BASE = process.env.BASE ?? '/osprey-portal';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'ignore',
  integrations: [react()],
  build: { format: 'directory' },
  markdown: {
    shikiConfig: { theme: 'github-dark-dimmed', wrap: true },
  },
});
