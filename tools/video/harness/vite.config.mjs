// Trang "harness": mount trực tiếp component Svelte của apps/web (không sửa web) để chụp/quay asset cho video.
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
const web = fileURLToPath(new URL('../../../apps/web/', import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [svelte()],
  resolve: { alias: { $lib: web + 'src/lib' } },
  server: { port: 5199, strictPort: true, hmr: false, watch: null, fs: { allow: [fileURLToPath(new URL('../../../', import.meta.url))] } },
  logLevel: 'warn',
});
