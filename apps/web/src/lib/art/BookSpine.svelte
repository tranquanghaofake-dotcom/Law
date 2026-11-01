<script lang="ts">
  // Gáy sách luật cách điệu (theo dòng sách luật in trong nước: nền vàng/xanh, ruy băng đỏ, chữ vàng/đỏ, cán cân;
  // mặt trống đồng thay Quốc huy, không có logo nhà xuất bản). Màu cố định như bìa thật, không đổi theo chế độ tối.
  import type { BookScheme, BookState } from '$lib/ui/shelf';
  import { ring } from './kit';
  let { scheme, state, percent, short, w = 30, h = 100 }: { scheme: BookScheme; state: BookState; percent: number; short: string; w?: number; h?: number } = $props();
  const C = {
    vang: { base: '#F1DB8A', dark: '#D9BC5C', band: '#C0282A', text: '#B3261E', gold: '#A87A1E' },
    xanh: { base: '#1F4E9E', dark: '#163C7C', band: '#C0282A', text: '#F6D35B', gold: '#E2B23C' },
    dem: { base: '#1E2E5C', dark: '#142046', band: '#2E4B8F', text: '#F6D35B', gold: '#E2B23C' },
  } as const;
  const c = $derived(C[scheme]);
  // phần chưa thuần thục phủ mờ từ đỉnh sách xuống: sách "đậm dần" từ dưới lên
  const veil = $derived(state === 'done' ? 0 : Math.round(h * (1 - Math.max(percent, 0) / 100)));
  const label = $derived(short.toUpperCase());
  // chữ dọc co theo độ dài tên để không tràn khỏi gáy (khoảng từ y=42 tới cán cân ở chân gáy)
  const fs = $derived(Math.max(4.5, Math.min(8.5, (h - 72) / (label.length * 0.72))));
</script>

<svg class="spine" viewBox="0 0 {w} {h}" width={w} height={h} aria-hidden="true" focusable="false">
  <defs>
    <linearGradient id="spine-shade-{scheme}" x1="0" x2="1">
      <stop offset="0" stop-color={c.dark} /><stop offset=".22" stop-color={c.base} /><stop offset=".8" stop-color={c.base} /><stop offset="1" stop-color={c.dark} />
    </linearGradient>
  </defs>
  <rect x=".75" y=".75" width={w - 1.5} height={h - 1.5} rx="2.5" fill="url(#spine-shade-{scheme})" stroke="#14213d" stroke-width="1.5" />
  <!-- đai vàng trên/dưới -->
  <path d="M3 7h{w - 6}M3 10h{w - 6}M3 {h - 10}h{w - 6}M3 {h - 7}h{w - 6}" stroke={c.gold} stroke-width="1.2" />
  <!-- mặt trống đồng thu nhỏ -->
  <circle cx={w / 2} cy="19" r="5.5" fill={c.gold} />
  <path d={ring(w / 2, 19, 3.2, 5, 12)} fill={c.base} />
  <circle cx={w / 2} cy="19" r="1.4" fill={c.base} />
  <!-- ruy băng đỏ ghi LUẬT -->
  <rect x="1.5" y="28" width={w - 3} height="9" fill={c.band} />
  <path d="M1.5 28l-1.5 4.5l1.5 4.5M{w - 1.5} 28l1.5 4.5l-1.5 4.5" fill={c.band} />
  <text x={w / 2} y="34.6" text-anchor="middle" font-size="5.6" font-weight="800" fill="#F6D35B" font-family="Be Vietnam Pro, sans-serif" letter-spacing=".3">LUẬT</text>
  <!-- tên môn chữ dọc -->
  <text x={w / 2} y="42" writing-mode="vertical-rl" font-size={fs} font-weight="800" fill={c.text} font-family="Be Vietnam Pro, sans-serif" letter-spacing=".6">{label}</text>
  <!-- cán cân nhỏ ở chân gáy -->
  <path d="M{w / 2} {h - 24}v-9M{w / 2 - 6} {h - 31}h12M{w / 2 - 6} {h - 31}l-2.5 5h5zM{w / 2 + 6} {h - 31}l-2.5 5h5zM{w / 2 - 3} {h - 24}h6" stroke={c.gold} stroke-width="1" fill="none" stroke-linejoin="round" />
  {#if state === 'done'}
    <!-- dấu son "đã thuần thục" -->
    <g transform="rotate(-8 {w / 2} {h - 17})">
      <rect x={w / 2 - 6} y={h - 23} width="12" height="12" rx="1" fill="#B3261E" stroke="#fff" stroke-width=".8" />
      <path d="M{w / 2 - 3} {h - 17}l2 2.4l4-5" stroke="#fff" stroke-width="1.3" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  {/if}
  {#if veil > 0}
    <rect class="veil" x=".75" y=".75" width={w - 1.5} height={veil} rx="2.5" />
  {/if}
  {#if state === 'ghost'}
    <rect x=".75" y=".75" width={w - 1.5} height={h - 1.5} rx="2.5" fill="none" stroke="#14213d" stroke-width="1" stroke-dasharray="3 2.5" opacity=".5" />
  {/if}
  <!-- vệt sáng lướt qua khi di chuột -->
  <rect class="shine" x="-14" y="0" width="7" height={h} fill="#fff" transform="skewX(-12)" />
</svg>
