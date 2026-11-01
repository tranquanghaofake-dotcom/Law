<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Thẻ chuyên cần — phong cách thẻ đen kim loại: nền đen nhám hoa văn chìm, viền hoa văn vàng, huy hiệu vàng kim ở giữa
  // (cán cân trên sách mở trong vành trống đồng — không phải logo VBF, không Quốc huy), 27 ký hoạ chạy quanh viền sáng dần theo ngày.
  // Màu lửa theo chu kỳ (đỏ → lam → tím → trắng → đen ánh kim → vô cực) là màu "nhũ" của ký hoạ, huy hiệu và viền.
  import { cardFor, TIER_NAMES, type Tier } from '$lib/game/card';
  import { CARD_GLYPHS } from './cardGlyphs';
  import { ring } from './kit';
  let { count = 0, longest = 0, size = 'full' }: { count?: number; longest?: number; size?: 'full' | 'mini' } = $props();
  const c = $derived(cardFor(count, longest));
  const uid = `sc${++seq}`;
  // 27 vị trí trên viền chữ nhật bo góc (trong dải hoa văn), bắt đầu giữa cạnh trên, theo chiều kim đồng hồ
  const W = 856, H = 540, M = 58;
  const per = 2 * (W - 2 * M) + 2 * (H - 2 * M);
  const pos = Array.from({ length: 27 }, (_, i) => {
    let d = ((i / 27) * per + (W - 2 * M) / 2) % per;
    const top = W - 2 * M, side = H - 2 * M;
    if (d < top) return { x: M + d, y: M };
    d -= top; if (d < side) return { x: W - M, y: M + d };
    d -= side; if (d < top) return { x: W - M - d, y: H - M };
    d -= top; return { x: M, y: H - M - d };
  });
  const pad = (n: number) => String(n).padStart(4, '0');
  const label = $derived(count > 0 ? `Thẻ chuyên cần: chuỗi ${count} ngày, ngày ${c.day}/30, màu ${TIER_NAMES[c.tier as Tier]}` : 'Thẻ chuyên cần: chưa có chuỗi');
  const foil = (t: Tier | null) => (t === 'vo-cuc' ? `url(#${uid}-holo)` : t ? `url(#${uid}-${t})` : `url(#${uid}-off)`);
  const FOILS: Record<Tier | 'off' | 'gold', [string, string, string]> = {
    off: ['#2a2a2a', '#3a3a3a', '#262626'], gold: ['#8a6a2a', '#f3dc9a', '#a9822f'],
    do: ['#9c3a22', '#ffb08f', '#c8502c'], lam: ['#1f5a96', '#bfe6ff', '#3b86c9'], tim: ['#5b2c96', '#e2c8ff', '#8a52d1'],
    trang: ['#9a9a9a', '#ffffff', '#cfcfcf'], den: ['#000000', '#e8c45a', '#000000'], 'vo-cuc': ['#000', '#000', '#000'],
  };
</script>

<svg class="streak-card {size}" class:burst={c.burst} viewBox="0 0 856 540" role="img" aria-label={label}>
  <defs>
    {#each Object.entries(FOILS) as [k, [a, b, d]] (k)}
      <linearGradient id="{uid}-{k}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color={a} /><stop offset=".45" stop-color={b} /><stop offset=".55" stop-color={b} /><stop offset="1" stop-color={d} /></linearGradient>
    {/each}
    <linearGradient id="{uid}-holo" x1="0" x2="1" y1="0" y2=".4">
      <stop offset="0" stop-color="#ff6f91" /><stop offset=".2" stop-color="#ffd36e" /><stop offset=".4" stop-color="#6effb4" /><stop offset=".6" stop-color="#5ec8ff" /><stop offset=".8" stop-color="#c58cff" /><stop offset="1" stop-color="#ff6f91" />
      <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;-1 0" dur="8s" repeatCount="indefinite" />
    </linearGradient>
    <radialGradient id="{uid}-bg" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#262626" /><stop offset="1" stop-color="#0c0c0c" /></radialGradient>
    <!-- hoa văn chìm: sen + mây cùng tông -->
    <pattern id="{uid}-damask" width="96" height="96" patternUnits="userSpaceOnUse">
      <g fill="none" stroke="#2e2e2e" stroke-width="2.2" stroke-linecap="round">
        <path d="M48 70c-14-4-20-18-14-32c6 4 11 12 14 22c3-10 8-18 14-22c6 14 0 28-14 32zM48 70c-5-12-5-26 0-38c5 12 5 26 0 38z" />
        <path d="M0 22h22a7 7 0 1 0-7-7M74 22h22M96 22a7 7 0 1 0-7-7M12 88q12-10 24 0M60 88q12-10 24 0" />
      </g>
    </pattern>
    <pattern id="{uid}-orn" width="24" height="16" patternUnits="userSpaceOnUse">
      <path d="M0 8q6-7 12 0t12 0M12 3v2M12 11v2" fill="none" stroke="#c9a85a" stroke-width="1.3" />
    </pattern>
    <linearGradient id="{uid}-sheen" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0" /><stop offset=".5" stop-color="#fff" stop-opacity=".16" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></linearGradient>
    <filter id="{uid}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
    <clipPath id="{uid}-clip"><rect width="856" height="540" rx="34" /></clipPath>
  </defs>
  <g clip-path="url(#{uid}-clip)">
    <rect width="856" height="540" fill="url(#{uid}-bg)" />
    <rect width="856" height="540" fill="url(#{uid}-damask)" />
    <!-- dải hoa văn viền: hai đường vàng + họa tiết sóng ở giữa -->
    <g class="cg-frame" filter={c.border ? `url(#${uid}-glow)` : undefined}>
      <rect x="40" y="40" width="776" height="460" rx="12" fill="none" stroke={c.border ? foil(c.border) : `url(#${uid}-gold)`} stroke-width="3" />
      <rect x="76" y="76" width="704" height="388" rx="8" fill="none" stroke={c.border ? foil(c.border) : `url(#${uid}-gold)`} stroke-width="2" />
      <path d="M44 44h768v452H44zM72 72v396h712V72z" fill="url(#{uid}-orn)" fill-rule="evenodd" opacity={c.border ? 0.9 : 0.45} />
    </g>
    <!-- 27 ký hoạ trên viền -->
    {#each CARD_GLYPHS as g, i (g.name)}
      {@const t = c.glyphs[i]}
      <g transform="translate({pos[i].x - 17} {pos[i].y - 17}) scale(1.42)" class="cg-glyph" class:lit={!!t} class:now={t && i === c.day - 1 && t === c.tier} filter={t ? `url(#${uid}-glow)` : undefined}>
        <title>{g.field}: {g.name}</title>
        <circle cx="12" cy="12" r="12.5" fill="#111" stroke={t ? foil(t) : '#3a3a3a'} stroke-width="1.2" />
        <path d={g.d} fill="none" stroke={foil(t)} stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
      </g>
    {/each}
    <text x="112" y="150" class="cg-head" fill="url(#{uid}-gold)">LUYỆN LUẬT</text>
    <text x="112" y="186" class="cg-sub" fill="#b9a26a">THẺ CHUYÊN CẦN</text>
    <!-- huy hiệu giữa: bầu dục tối + vành trống đồng + cán cân trên sách -->
    <ellipse cx="428" cy="290" rx="92" ry="104" fill="#141414" stroke="#2d2d2d" stroke-width="2" />
    <g class="cg-logo" filter={c.logo ? `url(#${uid}-glow)` : undefined}>
      <path d={ring(428, 290, 66, 80, 40)} fill={c.logo ? foil(c.logo) : `url(#${uid}-gold)`} opacity={c.logo ? 1 : 0.55} />
      <circle cx="428" cy="290" r="60" fill="none" stroke={c.logo ? foil(c.logo) : `url(#${uid}-gold)`} stroke-width="2" stroke-dasharray="2 7" opacity={c.logo ? 1 : 0.55} />
      <g fill="none" stroke={c.logo ? foil(c.logo) : `url(#${uid}-gold)`} stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity={c.logo ? 1 : 0.6}>
        <path d="M384 322q22-10 44 0q22-10 44 0v14q-22-9-44 0q-22-9-44 0zM428 322v14" />
        <path d="M428 236v84M394 254h68M394 254l-13 28h26zM462 254l-13 28h26zM414 318h28" />
      </g>
      <circle cx="428" cy="232" r="6" fill={c.logo ? foil(c.logo) : `url(#${uid}-gold)`} />
    </g>
    <!-- số: ngày chuỗi · kỷ lục -->
    <text x="226" y="304" text-anchor="middle" class="cg-num" fill="url(#{uid}-gold)">{pad(count)}</text>
    <text x="226" y="334" text-anchor="middle" class="cg-cap" fill="#9c8a5c">NGÀY CHUỖI</text>
    <text x="630" y="304" text-anchor="middle" class="cg-num" fill="url(#{uid}-gold)">{pad(Math.max(longest, count))}</text>
    <text x="630" y="334" text-anchor="middle" class="cg-cap" fill="#9c8a5c">KỶ LỤC{#if c.record} · <tspan fill={foil(c.record)} class="cg-capb">{TIER_NAMES[c.record].toUpperCase()}</tspan>{/if}</text>
    <text x="112" y="420" class="cg-cap" fill="#9c8a5c">CHU KỲ</text>
    <text x="210" y="420" class="cg-meta" fill="url(#{uid}-gold)">{c.tier ? `${TIER_NAMES[c.tier]} · ${c.day}/30` : 'Chưa bắt đầu'}</text>
    {#if c.burst}<rect width="856" height="540" fill={`url(#${uid}-holo)`} opacity=".18" class="cg-burst" />{/if}
    <!-- vệt sáng lướt -->
    <rect class="cg-sheen" x="-400" y="-100" width="300" height="740" fill="url(#{uid}-sheen)" transform="rotate(18)" />
  </g>
  <rect x="1" y="1" width="854" height="538" rx="33" fill="none" stroke="#3a3a3a" stroke-width="2" />
</svg>
