import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { contentDir } from './vite-plugin-content';

export default defineConfig({
  plugins: [svelte(), contentDir()],
  publicDir: 'static',
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  server: { port: 5173 },
});
