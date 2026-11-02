<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Tủ trưng bày bộ đồ theo chức danh. Tủ "lên đời" theo bậc: cơ sở gỗ sáng → tỉnh gỗ gụ nẹp đồng → trung ương sơn son
  // thếp vàng → lãnh đạo sơn mài đen thếp vàng có vành trống đồng chìm. Đèn rọi, bụi sáng, bóng phản chiếu trên sàn kính.
  // `celebrate`: chạy màn nhận chức (cánh kính mở, đèn bật, chữ biển tên hiện dần, hạt vàng) rồi gọi `ondone`.
  // Không quân hàm, cấp hiệu, Quốc huy, huân chương thật.
  import type { Avatar } from '$lib/game/wardrobe';
  import type { PostTier } from '$lib/game/career';
  import BookSpine from './BookSpine.svelte';
  import GarmentFlat from './GarmentFlat.svelte';
  import ShowcaseProps from './ShowcaseProps.svelte';
  import type { Branch } from '$lib/game/career';
  import type { Tier } from '$lib/game/card';
  import type { BookScheme } from '$lib/ui/shelf';
  import type { BookLevel } from '$lib/game/books';
  import { ring } from './kit';
  type ShelfBook = { key: string; scheme: BookScheme; level: BookLevel; label: string };
  let { avatar, title = 'Công dân', subtitle = '', books = [], tier = null, celebrate = false, ondone, branch = 'hanh-phap', medals = [], l3 = 0 }:
    { avatar: Avatar; title?: string; subtitle?: string; accent?: string; books?: ShelfBook[]; tier?: PostTier | null; celebrate?: boolean; ondone?: () => void; branch?: Branch; medals?: { tier: Tier; count: number }[]; l3?: number } = $props();
  const uid = `pt${++seq}`;
  const motes = Array.from({ length: 14 }, (_, i) => ({ x: 18 + ((i * 37) % 64), y: 12 + ((i * 53) % 60), d: (i % 5) * 1.3, s: 6 + (i % 4) * 2 }));
  const gold = Array.from({ length: 22 }, (_, i) => ({ x: 4 + ((i * 41) % 92), d: (i % 7) * 0.12, r: (i * 47) % 360 }));
  // kỷ niệm chương vòng lửa (từ thẻ chuyên cần): dải ruy băng + đĩa màu lửa
  const MEDAL: Record<Tier, { a: string; b: string; disc: string }> = {
    do: { a: '#e3300b', b: '#ffa32a', disc: '#ffb347' }, lam: { a: '#0a5cff', b: '#38b6ff', disc: '#8fd3ff' },
    tim: { a: '#7417ff', b: '#b65cff', disc: '#d4a6ff' }, 'trang-den': { a: '#0b0b0d', b: '#f4f6fa', disc: '#ffffff' },
  };
  const rich = $derived(tier === 'trung-uong' || tier === 'lanh-dao');
  $effect(() => {
    if (!celebrate) return;
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => ondone?.(), reduce ? 50 : 3200);
    return () => clearTimeout(t);
  });
</script>

{#snippet corner(cls: string)}
  <svg class="sc-corner {cls}" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <path d="M3 37V12Q3 3 12 3h25M8 37V15q0-7 7-7h22M14 22q0-8 8-8q5 0 5 5q0 3-3 3q-2 0-2-2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
  </svg>
{/snippet}

<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs><linearGradient id="{uid}-gm" x1="0" x2="1"><stop offset="0" stop-color="#8a6526" /><stop offset=".5" stop-color="#f3dc98" /><stop offset="1" stop-color="#a87c34" /></linearGradient></defs></svg>
<figure class="showcase fx-{avatar.effect}" class:celebrate data-tier={tier ?? 'none'}>
  {#if rich}{@render corner('tl')}{@render corner('tr')}{@render corner('bl')}{@render corner('br')}{/if}
  {#if tier === 'lanh-dao'}<span class="sc-lamp l" aria-hidden="true"></span><span class="sc-lamp r" aria-hidden="true"></span>{/if}
  <header class="sc-head">
    <p class="sc-plaque" style="--len:{title.length}">{title}</p>
    {#if subtitle}<p class="sc-sub">{subtitle}</p>{/if}
  </header>
  <div class="sc-window">
    {#if tier === 'lanh-dao' || avatar.effect === 'trong-dong' || avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
      <svg class="sc-drum" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <g class="sun-spin"><path d={ring(100, 100, 84, 96, 48)} fill="currentColor" /><circle cx="100" cy="100" r="76" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="1.5 6" /><circle cx="100" cy="100" r="58" fill="none" stroke="currentColor" stroke-width="1" /></g>
      </svg>
    {/if}
    <span class="sc-cone" aria-hidden="true"></span>
    {#if medals.length}
      <!-- vách trái: kỷ niệm chương mỗi vòng lửa 30 ngày đã hoàn tất -->
      <svg class="sc-medals" viewBox="0 0 {medals.length * 26 + 4} 52" aria-hidden="true" focusable="false">
        {#each medals as md, k (md.tier)}
          {@const c = MEDAL[md.tier]}
          <g transform="translate({k * 26 + 4} 2)" stroke="#2b2420" stroke-width=".8">
            <path d="M2 0h18l-3 16H5Z" fill={c.a} /><path d="M8 0h6l-1 16h-4Z" fill={c.b} stroke="none" />
            <circle cx="11" cy="27" r="10" fill="url(#{uid}-gm)" /><circle cx="11" cy="27" r="6.5" fill={c.disc} />
            <path d="M11 22q3 3 1 6q2-1 2-3q2 3-1 6h-4q-3-3 0-6q0 2 2 3q-1-3 0-6Z" fill={c.a} stroke="none" />
            {#if md.count > 1}<text x="11" y="48" text-anchor="middle" font-size="8" font-weight="700" fill="#5a4636" stroke="none">×{md.count}</text>{/if}
          </g>
        {/each}
      </svg>
    {/if}
    {#if l3 > 0}
      <!-- vách phải: giấy ghi nhận cách điệu (không mô phỏng bằng khen thật) -->
      <svg class="sc-cert" viewBox="0 0 60 46" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="58" height="44" rx="2" fill="url(#{uid}-gm)" stroke="#2b2420" stroke-width=".8" />
        <rect x="5" y="5" width="50" height="36" fill="#fbf5e6" stroke="#b08a4a" stroke-width=".6" />
        <text x="30" y="14" text-anchor="middle" font-size="5" font-weight="700" letter-spacing=".4" fill="#7a2020">GIẤY GHI NHẬN</text>
        <text x="30" y="30" text-anchor="middle" font-size="13" font-weight="800" fill="#2b2420">{l3}</text>
        <text x="30" y="37" text-anchor="middle" font-size="4.2" fill="#5a4636">sách cấp 3</text>
        <circle cx="48" cy="36" r="3.4" fill="#a8322b" opacity=".85" />
      </svg>
    {/if}
    <ShowcaseProps {branch} {tier} side="left" /><ShowcaseProps {branch} {tier} side="right" />
    <span class="sc-floor" aria-hidden="true"></span>
    <div class="sc-photo"><GarmentFlat outfit={avatar.outfit} /></div>
    <div class="sc-reflect" aria-hidden="true"><GarmentFlat outfit={avatar.outfit} /></div>
    <span class="sc-bulb" aria-hidden="true"></span>
    <span class="sc-motes" aria-hidden="true">{#each motes as m, i (i)}<i style="left:{m.x}%;top:{m.y}%;animation-delay:-{m.d}s;animation-duration:{m.s}s"></i>{/each}</span>
    {#if avatar.effect === 'hat-sang' || celebrate}
      <span class="sc-gold" aria-hidden="true">{#each gold as g, i (i)}<i style="left:{g.x}%;animation-delay:{1.2 + g.d}s;--r:{g.r}deg"></i>{/each}</span>
    {/if}
    <span class="sc-door l" aria-hidden="true"></span><span class="sc-door r" aria-hidden="true"></span>
    <span class="sc-glass" aria-hidden="true"></span>
  </div>
  <div class="sc-plinth">
    <span class="sc-acc left" aria-hidden="true">
      {#if avatar.accessory === 'kinh'}
        <svg viewBox="0 0 48 24"><g fill="none" stroke="#e3c27a" stroke-width="2.2"><circle cx="13" cy="14" r="8" /><circle cx="35" cy="14" r="8" /><path d="M21 13h6M5 10l-4-4M43 10l4-4" /></g></svg>
      {:else if avatar.accessory === 'cap'}
        <svg viewBox="0 0 48 32"><rect x="3" y="8" width="42" height="22" rx="3" fill="#7a5233" stroke="#2a1d14" stroke-width="1.5" /><path d="M17 8V4h14v4M3 17h42" fill="none" stroke="#2a1d14" stroke-width="1.5" /><rect x="20" y="14" width="8" height="6" rx="1" fill="#e3c27a" /></svg>
      {:else if avatar.accessory === 'so'}
        <svg viewBox="0 0 40 32"><rect x="6" y="4" width="28" height="26" rx="2" fill="#8c2f28" stroke="#2a1d14" stroke-width="1.5" /><path d="M10 4v26" stroke="#e3c27a" stroke-width="1.5" /><rect x="15" y="10" width="14" height="5" fill="#e3c27a" opacity=".8" /></svg>
      {:else if avatar.accessory === 'but'}
        <svg viewBox="0 0 48 16"><path d="M4 10l34-4l6 2l-6 3l-34 1z" fill="#1d1d22" stroke="#e3c27a" stroke-width="1.2" /><path d="M10 8.5l16-2" stroke="#e3c27a" stroke-width="1" /></svg>
      {:else if avatar.accessory === 'huy-hieu'}
        <svg viewBox="0 0 32 32"><circle cx="16" cy="16" r="11" fill="#e3c27a" stroke="#7a5a26" stroke-width="1.5" /><circle cx="16" cy="16" r="6" fill="none" stroke="#7a5a26" stroke-width="1.2" /><path d="M16 11v10M12 16h8" stroke="#7a5a26" stroke-width="1.2" /></svg>
      {/if}
    </span>
    <ul class="sc-books" aria-hidden="true">
      {#each books as b (b.key)}<li><BookSpine scheme={b.scheme} level={b.level} label={b.label} w={22} h={74} /></li>{/each}
      {#each Array(Math.max(0, 6 - books.length)) as _, i (i)}<li class="ghost"><span></span></li>{/each}
    </ul>
    <span class="sc-acc right" aria-hidden="true">
      <svg viewBox="0 0 40 40"><defs><linearGradient id="{uid}-br" x1="0" x2="1"><stop offset="0" stop-color="#9c7a3c" /><stop offset=".5" stop-color="#f1d896" /><stop offset="1" stop-color="#9c7a3c" /></linearGradient></defs>
        <g fill="none" stroke="url(#{uid}-br)" stroke-width="2" stroke-linecap="round"><path d="M20 6v28M8 11h24M8 11l-5 10h10zM32 11l-5 10h10zM14 34h12" /></g><circle cx="20" cy="5" r="2.2" fill="#f1d896" /></svg>
    </span>
  </div>
</figure>
