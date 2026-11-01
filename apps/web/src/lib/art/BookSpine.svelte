<script lang="ts">
  // Gáy sách theo cấp (spec thăng chức §2.1): 0 khung nét đứt · 1 bìa mềm giấy kem · 2 bìa cứng màu môn, đai vàng, ruy băng LUẬT
  // · 3 bìa da mạ vàng, mặt trống đồng nổi, dấu son, dải lụa. Cách điệu dòng sách luật trong nước; không Quốc huy, không logo NXB.
  import type { BookScheme } from '$lib/ui/shelf';
  import type { BookLevel } from '$lib/game/books';
  import { ring } from './kit';
  let { scheme, level, label, w = 30, h = 100, review = false }: { scheme: BookScheme; level: BookLevel; label: string; w?: number; h?: number; review?: boolean } = $props();
  const C = {
    vang: { base: '#F1DB8A', dark: '#D9BC5C', band: '#C0282A', text: '#B3261E', leather: '#7A2A1C' },
    xanh: { base: '#1F4E9E', dark: '#163C7C', band: '#C0282A', text: '#F6D35B', leather: '#15305F' },
    dem: { base: '#1E2E5C', dark: '#142046', band: '#2E4B8F', text: '#F6D35B', leather: '#1A1630' },
  } as const;
  const c = $derived(C[scheme]);
  const GOLD = '#E2B23C';
  const body = $derived(level === 1 ? { a: '#EDE3CC', b: '#F7F0DE' } : level === 3 ? { a: '#000000', b: c.leather } : { a: c.dark, b: c.base });
  const ink = $derived(level === 1 ? '#5B4A2E' : level === 3 ? GOLD : c.text);
  const text = $derived(label.toUpperCase());
  const fs = $derived(Math.max(4.5, Math.min(8.5, (h - 66) / (text.length * 0.72))));
  const gid = $derived(`bs-${scheme}-${level}`);
</script>

<svg class="spine lv{level}" viewBox="0 0 {w} {h}" width={w} height={h} aria-hidden="true" focusable="false">
  {#if level === 0}
    <rect x="1" y="1" width={w - 2} height={h - 2} rx="2.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 2.5" opacity=".45" />
  {:else}
    <defs>
      <linearGradient id={gid} x1="0" x2="1">
        <stop offset="0" stop-color={body.a} /><stop offset=".22" stop-color={body.b} /><stop offset=".8" stop-color={body.b} /><stop offset="1" stop-color={body.a} />
      </linearGradient>
    </defs>
    <rect x=".75" y=".75" width={w - 1.5} height={h - 1.5} rx={level === 1 ? 1.5 : 2.5} fill="url(#{gid})" stroke="#14213d" stroke-width="1.4" />
    {#if level === 1}
      <!-- bìa mềm: mép giấy, nhãn dán -->
      <path d="M3 5h{w - 6}M3 {h - 5}h{w - 6}" stroke="#B9A882" stroke-width="1" />
      <rect x="3.5" y="12" width={w - 7} height="12" fill="#FFFDF6" stroke="#B9A882" stroke-width=".8" />
      <text x={w / 2} y="20.5" text-anchor="middle" font-size="5" font-weight="800" fill="#5B4A2E" font-family="Be Vietnam Pro, sans-serif">LUẬT</text>
    {:else}
      <path d="M3 7h{w - 6}M3 10h{w - 6}M3 {h - 10}h{w - 6}M3 {h - 7}h{w - 6}" stroke={GOLD} stroke-width={level === 3 ? 1.6 : 1.1} />
      <circle cx={w / 2} cy="19" r="5.5" fill={GOLD} />
      <path d={ring(w / 2, 19, 3.2, 5, 12)} fill={level === 3 ? c.leather : c.base} />
      <rect x="1.5" y="27" width={w - 3} height="8" fill={level === 3 ? GOLD : c.band} />
      <text x={w / 2} y="33" text-anchor="middle" font-size="5.2" font-weight="800" fill={level === 3 ? c.leather : '#F6D35B'} font-family="Be Vietnam Pro, sans-serif">LUẬT</text>
    {/if}
    <text x={w / 2} y="40" writing-mode="vertical-rl" font-size={fs} font-weight="800" fill={ink} font-family="Be Vietnam Pro, sans-serif" letter-spacing=".5">{text}</text>
    {#if level === 3}
      <rect x="3" y="3" width={w - 6} height={h - 6} rx="1.5" fill="none" stroke={GOLD} stroke-width=".8" opacity=".8" />
      <g transform="rotate(-8 {w / 2} {h - 15})">
        <rect x={w / 2 - 6} y={h - 21} width="12" height="12" rx="1" fill="#B3261E" stroke="#fff" stroke-width=".8" />
        <path d="M{w / 2 - 3} {h - 15}l2 2.4l4-5" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
      </g>
      <path d="M{w - 8} {h - 1}v8l2-2l2 2v-8" fill="#C0282A" stroke="#7A1A15" stroke-width=".6" />
    {/if}
    {#if review}<circle cx={w - 5} cy="5" r="3.2" fill="#E2B23C" stroke="#14213d" stroke-width=".8" />{/if}
  {/if}
  <rect class="shine" x="-14" y="0" width="7" height={h} fill="#fff" transform="skewX(-12)" />
</svg>
