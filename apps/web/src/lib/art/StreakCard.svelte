<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Thẻ chuyên cần: thẻ nền son, viền kép, huy hiệu riêng (cán cân trên sách mở trong vành trống đồng — không phải logo VBF),
  // 27 ký hoạ quanh huy hiệu sáng dần theo ngày chuỗi. size 'full' (Hồ sơ) | 'mini' (sidebar, thanh trên, rail).
  import { cardFor, TIER_NAMES, type Tier } from '$lib/game/card';
  import { CARD_GLYPHS } from './cardGlyphs';
  import { ring } from './kit';
  let { count = 0, longest = 0, size = 'full' }: { count?: number; longest?: number; size?: 'full' | 'mini' } = $props();
  const c = $derived(cardFor(count, longest));
  // vị trí 27 ký hoạ trên elip quanh huy hiệu, bắt đầu từ đỉnh, theo chiều kim đồng hồ
  const pos = Array.from({ length: 27 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 27;
    return { x: 428 + Math.cos(a) * 312, y: 268 + Math.sin(a) * 150 };
  });
  const uid = `sc${++seq}`;
  const label = $derived(count > 0 ? `Thẻ chuyên cần: chuỗi ${count} ngày, ngày ${c.day}/30 của chu kỳ ${TIER_NAMES[c.tier as Tier]}` : 'Thẻ chuyên cần: chưa có chuỗi');
</script>

<svg class="streak-card {size}" class:burst={c.burst} viewBox="0 0 856 540" role="img" aria-label={label}>
  <defs>
    <linearGradient id="{uid}-bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#a3302b" /><stop offset=".55" stop-color="#8e2420" /><stop offset="1" stop-color="#6e1a17" />
    </linearGradient>
    <linearGradient id="{uid}-inf" x1="0" x2="1">
      <stop offset="0" stop-color="#ff6b4a" /><stop offset=".25" stop-color="#ffd166" /><stop offset=".5" stop-color="#4fb3ff" /><stop offset=".75" stop-color="#b779ff" /><stop offset="1" stop-color="#ff6b4a" />
      <animateTransform attributeName="gradientTransform" type="translate" from="-1 0" to="1 0" dur="6s" repeatCount="indefinite" />
    </linearGradient>
    <filter id="{uid}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <radialGradient id="{uid}-burst"><stop offset="0" stop-color="#fff6d6" stop-opacity=".75" /><stop offset="1" stop-color="#fff6d6" stop-opacity="0" /></radialGradient>
  </defs>
  <rect width="856" height="540" rx="30" fill="url(#{uid}-bg)" />
  <!-- hoa văn mây chìm -->
  <g fill="none" stroke="#ffffff" stroke-opacity=".07" stroke-width="3" stroke-linecap="round">
    {#each [[60, 120], [700, 90], [90, 430], [720, 440], [400, 470]] as [x, y] (x)}
      <path transform="translate({x} {y})" d="M0 30h70M8 30a10 10 0 0 1 14-11a14 14 0 0 1 27-4a11 11 0 0 1 20 8M30 26a5 5 0 1 1 5-5" />
    {/each}
  </g>
  <!-- viền kép -->
  <g class="cg-border tier-{c.border ?? 'off'}" fill="none" filter={c.border ? `url(#${uid}-glow)` : undefined}>
    <rect x="20" y="20" width="816" height="500" rx="20" stroke-width="5" stroke={c.border === 'vo-cuc' ? `url(#${uid}-inf)` : undefined} />
    <rect x="34" y="34" width="788" height="472" rx="14" stroke-width="2" stroke={c.border === 'vo-cuc' ? `url(#${uid}-inf)` : undefined} />
  </g>
  <text x="428" y="84" text-anchor="middle" class="cg-head">LUYỆN LUẬT</text>
  <text x="428" y="498" text-anchor="middle" class="cg-title">THẺ CHUYÊN CẦN</text>
  <!-- 27 ký hoạ -->
  {#each CARD_GLYPHS as g, i (g.name)}
    {@const t = c.glyphs[i]}
    <g transform="translate({pos[i].x - 24} {pos[i].y - 24}) scale(2)" class="cg-glyph tier-{t ?? 'off'}" class:now={t && i === c.day - 1 && t === c.tier} filter={t ? `url(#${uid}-glow)` : undefined}>
      <title>{g.field}: {g.name}</title>
      <path d={g.d} fill="none" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke={t === 'vo-cuc' ? `url(#${uid}-inf)` : undefined} />
    </g>
  {/each}
  <!-- huy hiệu: vành trống đồng + sách mở + cán cân -->
  <g class="cg-logo tier-{c.logo ?? 'off'}" filter={c.logo ? `url(#${uid}-glow)` : undefined}>
    <circle cx="428" cy="268" r="104" fill="#000" fill-opacity=".14" />
    <path d={ring(428, 268, 92, 104, 44)} class="cg-fill" fill={c.logo === 'vo-cuc' ? `url(#${uid}-inf)` : undefined} />
    <g fill="none" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke={c.logo === 'vo-cuc' ? `url(#${uid}-inf)` : undefined}>
      <circle cx="428" cy="268" r="84" stroke-dasharray="2 9" />
      <path d="M366 308q31-14 62 0q31-14 62 0v20q-31-12-62 0q-31-12-62 0zM428 308v20" />
      <path d="M428 186v116M380 210h96M380 210l-18 40h36zM476 210l-18 40h36zM410 302h36" />
      <circle cx="428" cy="184" r="7" />
    </g>
  </g>
  {#if c.burst}<circle class="cg-burst" cx="428" cy="268" r="300" fill="url(#{uid}-burst)" />{/if}
  {#if size === 'full' && c.record}
    <g transform="translate(760 104)"><circle r="20" class="cg-rec tier-{c.record}" /><text y="44" text-anchor="middle" class="cg-small">kỷ lục</text></g>
  {/if}
</svg>
