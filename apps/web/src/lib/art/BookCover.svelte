<script lang="ts">
  // Bìa giáo trình (spec phần nhìn đợt 4 §3.2): viewBox 120×160 (3:4). Màu phẳng theo kệ nhóm ngành (cố định như sách in,
  // không đổi theo chế độ tối); mép giấy kem + viền để bìa tách khỏi nền tối. Trang trí: aria-hidden; tên môn thật nằm ở DOM bên ngoài.
  // Không ghi tên/logo nhà xuất bản thật; không Quốc huy. Chữ "LUYỆN LUẬT" đứng ở chỗ tên NXB.
  import type { EmblemName } from './registry';
  import Emblem from './Emblem.svelte';
  import { wrapTitle } from '$lib/ui/bookCover';
  let { title, monogram, color, emblem = 'sach', percent = 0, state = 'new', w = 108, class: cls = '' }: {
    title: string; monogram: string; color: string; emblem?: EmblemName; percent?: number; state?: 'new' | 'learning' | 'done'; w?: number; class?: string;
  } = $props();
  const lines = $derived(wrapTitle(title, 14, 3));
  const mono = $derived(monogram.length > 3 ? (monogram.length > 4 ? 15 : 19) : 26);
  const CREAM = '#F7F0DE';
  const GOLD = '#E2B23C';
</script>

<svg class="book-cover {state} {cls}" viewBox="0 0 120 160" width={w} height={w * 4 / 3} aria-hidden="true" focusable="false">
  <!-- ruột sách (mép giấy) lộ bên phải và dưới -->
  <rect x="5" y="5" width="114" height="154" rx="1.5" fill="#EFE6CF" stroke="#C9BFA6" stroke-width=".8" />
  <path d="M119 10v148M117 12v146" stroke="#D9CFB5" stroke-width=".6" />
  <!-- bìa -->
  <rect x=".5" y=".5" width="114" height="152" rx="2" fill={color} stroke="#14213d" stroke-width="1" />
  <rect x=".5" y=".5" width="7" height="152" rx="2" fill="#000" opacity=".18" />
  <!-- khung kép mảnh -->
  <rect x="11" y="8" width="97" height="137" fill="none" stroke={GOLD} stroke-width=".9" opacity=".9" />
  <rect x="14" y="11" width="91" height="131" fill="none" stroke={GOLD} stroke-width=".45" opacity=".7" />
  <text x="59.5" y="22.5" text-anchor="middle" font-size="6" font-weight="700" letter-spacing="1.6" fill={CREAM} font-family="Be Vietnam Pro, sans-serif">GIÁO TRÌNH</text>
  <!-- dải kem với chữ lồng -->
  <rect x="7.5" y="29" width="100" height="40" fill={CREAM} />
  <path d="M7.5 31.5h100M7.5 66.5h100" stroke={color} stroke-width=".9" opacity=".55" />
  <text x="59.5" y="49.5" text-anchor="middle" dominant-baseline="central" font-size={mono} font-weight="800" fill={color} font-family="Noto Serif Display, Noto Serif, Georgia, serif" letter-spacing={monogram.length > 3 ? 0 : 1}>{monogram}</text>
  <!-- tên môn -->
  {#each lines as line, i (i)}
    <text x="59.5" y={84 + i * 11.5} text-anchor="middle" font-size="8.4" font-weight="700" fill={CREAM} font-family="Be Vietnam Pro, sans-serif">{line}</text>
  {/each}
  <!-- huy hiệu chương/môn trong vành trống đồng -->
  <g transform="translate(46.5 112)"><Emblem name={emblem} size={26} /></g>
  <text x="59.5" y="149" text-anchor="middle" font-size="4.6" letter-spacing="1.2" fill={CREAM} opacity=".85" font-family="Be Vietnam Pro, sans-serif">LUYỆN LUẬT</text>
  {#if state === 'learning'}
    <!-- dải lụa đánh dấu thò mép dưới + thanh tiến độ mảnh -->
    <path d="M96 118v40l4-4l4 4v-40z" fill="#C0282A" stroke="#7A1A15" stroke-width=".6" />
    <rect x="14" y="143" width="91" height="2" fill="#000" opacity=".25" />
    <rect x="14" y="143" width={Math.max(2, 91 * Math.min(100, percent) / 100)} height="2" fill={GOLD} />
  {:else if state === 'done'}
    <g transform="rotate(-10 97 22)">
      <rect x="88" y="13" width="18" height="18" rx="1.5" fill="#B3261E" stroke="#fff" stroke-width="1" />
      <path d="M92 22l3.5 3.5l6.5-7.5" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  {/if}
</svg>
