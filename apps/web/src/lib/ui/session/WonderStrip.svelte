<script lang="ts">
  // Dải "Thắp sáng" ngay dưới thanh tiến độ: hình thu nhỏ kỳ quan đang thắp + % sáng + tên. Mỗi câu đúng, nét mới loé sáng.
  import { reducedMotion } from '$lib/fx/confetti';
  import type { Wonder } from '$lib/fx/wonders';
  import type { GlowTier } from './combo';
  import { litPercent } from './reward';
  import WonderArt from './WonderArt.svelte';

  let { wonder = null, lit = [], tier = null }: { wonder?: Wonder | null; lit?: { i: number; tier: GlowTier }[]; tier?: GlowTier | null } = $props();
  const pct = $derived(wonder ? litPercent(lit.length, wonder.paths.length) : 0);
  const rm = $derived(reducedMotion());
  // nhịp loé khi có nét mới (đổi số nét → bật lại class trong một khung hình)
  let flash = $state(false);
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const n = lit.length;
    if (n > last && !rm) {
      flash = true; clearTimeout(timer);
      timer = setTimeout(() => (flash = false), 650);
    }
    last = n;
    return () => clearTimeout(timer);
  });
</script>

<section class="wonder-strip" class:flash class:rm data-tier={tier ?? ''} aria-label="Thắp sáng kỳ quan">
  <div class="thumb">{#if wonder}<WonderArt {wonder} {lit} />{/if}</div>
  <div class="meta">
    <p class="kick">Thắp sáng</p>
    <p class="name">{wonder ? wonder.name : 'Đang dựng kỳ quan…'}</p>
    {#if wonder}<p class="place">{wonder.place}</p>{/if}
  </div>
  <p class="pct" aria-label="Đã sáng {pct} phần trăm"><b>{pct}</b><small>%</small></p>
  <i class="fill" aria-hidden="true"><span style="transform:scaleX({pct / 100})"></span></i>
</section>

<style>
  .wonder-strip {
    position: relative; display: flex; align-items: center; gap: var(--sp-3); height: 68px; margin: calc(-1 * var(--sp-2)) 0 var(--sp-4);
    padding: 0 var(--sp-3); border: 1px solid var(--line); border-radius: var(--r-md); background: var(--card); overflow: hidden;
  }
  .thumb { flex: none; width: 92px; height: 56px; }
  .meta { flex: 1; min-width: 0; line-height: 1.25; }
  .meta p { margin: 0; }
  .kick { font-size: var(--fs-xs); color: var(--muted); text-transform: uppercase; letter-spacing: .06em; }
  .name { font-weight: 700; font-size: var(--fs-md); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .place { font-size: var(--fs-xs); color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pct { margin: 0; flex: none; display: flex; align-items: baseline; gap: 1px; font-variant-numeric: tabular-nums; color: var(--ink); }
  .pct b { font-size: var(--fs-2xl); font-weight: 800; line-height: 1; }
  .pct small { font-size: var(--fs-sm); color: var(--muted); font-weight: 700; }
  .fill { position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: var(--line); }
  .fill span { display: block; height: 100%; background: linear-gradient(90deg, var(--fire-a, #c4220a), var(--fire-b, #ff6a3a)); transform-origin: 0 50%; transition: transform .45s ease; }
  /* loé: lớp phủ sáng mờ dần (chỉ opacity) mỗi khi có nét mới */
  .wonder-strip::after { content: ''; position: absolute; inset: 0; pointer-events: none; opacity: 0; background: radial-gradient(60% 120% at 20% 50%, color-mix(in srgb, var(--fire-b, #ff6a3a) 38%, transparent), transparent 70%); }
  .wonder-strip.flash::after { animation: strip-flash .65s ease-out; }
  @keyframes strip-flash { 0% { opacity: 1; } 100% { opacity: 0; } }
  .rm .fill span { transition: none; }
  @media (max-width: 479px) { .thumb { width: 76px; height: 50px; } .pct b { font-size: var(--fs-xl); } }
</style>
