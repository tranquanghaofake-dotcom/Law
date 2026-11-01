import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { fileURLToPath } from 'node:url';
import { VitePWA } from 'vite-plugin-pwa';
import { contentDir } from './vite-plugin-content';

// BASE_PATH: '/' khi chạy máy/Cloudflare; '/Law/' khi deploy GitHub Pages (xem .github/workflows/pages.yml).
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    svelte(),
    contentDir(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'sfx/*.ogg', 'art/*.webp'],
      manifest: {
        name: 'Luyện Luật',
        short_name: 'Luyện Luật',
        description: 'Học khái niệm luật theo bậc ghi nhớ, có căn cứ điều luật gốc.',
        lang: 'vi',
        theme_color: '#14213d',
        background_color: '#f7f4ee',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webp,ogg,woff2}'],
        runtimeCaching: [
          { urlPattern: /\/content\/.*\.json$/, handler: 'StaleWhileRevalidate', options: { cacheName: 'content' } },
          { urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//, handler: 'CacheFirst', options: { cacheName: 'fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 } } },
        ],
      },
    }),
  ],
  publicDir: 'static',
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  server: { port: 5173 },
});
