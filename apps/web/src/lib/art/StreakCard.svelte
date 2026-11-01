<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Thẻ chuyên cần — thẻ trơn bo tròn (không viền), 27 ký hoạ ẩn mờ trên nền rải theo xoắn ốc tỉ lệ vàng, sáng dần theo ngày;
  // logo bông sen 8 cánh ôm cán cân (không phải logo VBF, không Quốc huy). Rê chuột: thẻ nghiêng 3D + vệt sáng theo chuột
  // (học kỹ thuật biến CSS theo con trỏ của pokemon-cards-css (GPL-3.0) và vanilla-tilt (MIT) — tự viết, không chép mã).
  import { cardFor, TIER_NAMES, type Tier } from '$lib/game/card';
  import { CARD_GLYPHS } from './cardGlyphs';
  let { count = 0, longest = 0, size = 'full' }: { count?: number; longest?: number; size?: 'full' | 'mini' } = $props();
  const c = $derived(cardFor(count, longest));
  const uid = `sc${++seq}`;
  const GA = Math.PI * (3 - Math.sqrt(5)); // góc vàng
  const pos = Array.from({ length: 27 }, (_, i) => {
    const r = 58 * Math.sqrt(i + 5.2), a = i * GA - Math.PI / 2;
    const x = 428 + Math.cos(a) * r * 1.2, y = 268 + Math.sin(a) * r * 0.66;
    // giữ ký hoạ trong dải giữa, không đè chữ ở bốn góc
    return { x, y: Math.min(400, Math.max(146, y)), s: 1.5 + ((i * 7) % 5) * 0.16, rot: ((i * 37) % 30) - 15 };
  });
  const pad = (n: number) => String(n).padStart(4, '0');
  const label = $derived(count > 0 ? `Thẻ chuyên cần: chuỗi ${count} ngày, ngày ${c.day}/30, màu ${TIER_NAMES[c.tier as Tier]}` : 'Thẻ chuyên cần: chưa có chuỗi');
  const INK: Record<Tier, string> = { do: '#ff9b7a', lam: '#8fd0ff', tim: '#d2adff', trang: '#ffffff', den: '#f2cf6b', 'vo-cuc': `url(#${uid}-holo)` };
  const ink = (t: Tier | null) => (t ? INK[t] : '#ffffff');
  // nghiêng theo chuột
  let el: HTMLDivElement | undefined = $state();
  let tilt = $state({ rx: 0, ry: 0, mx: 50, my: 50, on: false });
  function move(e: PointerEvent) {
    if (size === 'mini' || !el) return;
    const b = el.getBoundingClientRect();
    const px = (e.clientX - b.left) / b.width, py = (e.clientY - b.top) / b.height;
    tilt = { rx: (0.5 - py) * 14, ry: (px - 0.5) * 18, mx: px * 100, my: py * 100, on: true };
  }
  const leave = () => (tilt = { rx: 0, ry: 0, mx: 50, my: 50, on: false });
</script>

<div class="sc-wrap {size}" class:on={tilt.on} bind:this={el} onpointermove={move} onpointerleave={leave} role="img" aria-label={label}
  style="--rx:{tilt.rx}deg; --ry:{tilt.ry}deg; --mx:{tilt.mx}%; --my:{tilt.my}%">
  <svg class="streak-card {size} tier-{c.tier ?? 'none'}" class:burst={c.burst} viewBox="0 0 856 540" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="{uid}-bg" cx=".3" cy=".2" r="1.1"><stop offset="0" stop-color="#34343a" /><stop offset=".55" stop-color="#1b1b20" /><stop offset="1" stop-color="#0d0d10" /></radialGradient>
      <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8924a" /><stop offset=".45" stop-color="#f6e2a8" /><stop offset=".6" stop-color="#d9b56a" /><stop offset="1" stop-color="#8e6c2c" /></linearGradient>
      <linearGradient id="{uid}-holo" x1="0" x2="1" y1="0" y2=".5">
        <stop offset="0" stop-color="#ff7aa2" /><stop offset=".2" stop-color="#ffd27a" /><stop offset=".4" stop-color="#7affc0" /><stop offset=".6" stop-color="#6fd0ff" /><stop offset=".8" stop-color="#c79bff" /><stop offset="1" stop-color="#ff7aa2" />
        <animateTransform attributeName="gradientTransform" type="translate" values="-1 0;1 0;-1 0" dur="9s" repeatCount="indefinite" />
      </linearGradient>
      <filter id="{uid}-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="{uid}-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect width="856" height="540" rx="40" fill="url(#{uid}-bg)" />
    <!-- quầng màu lửa mờ phía sau (đậm dần theo ngày) -->
    {#if c.tier}<ellipse cx="428" cy="268" rx={150 + c.day * 7} ry={90 + c.day * 4} fill={ink(c.tier)} opacity={0.05 + c.day * 0.004} filter="url(#{uid}-soft)" />{/if}
    <!-- 27 ký hoạ ẩn trên nền -->
    {#each CARD_GLYPHS as g, i (g.name)}
      {@const t = c.glyphs[i]}
      <g transform="translate({pos[i].x} {pos[i].y}) rotate({pos[i].rot}) scale({pos[i].s}) translate(-12 -12)" class="cg-glyph" class:lit={!!t} class:now={!!t && i === c.day - 1 && t === c.tier} filter={t ? `url(#${uid}-glow)` : undefined}>
        <title>{g.field}: {g.name}</title>
        <path d={g.d} fill="none" stroke={ink(t)} stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" opacity={t ? (t === c.tier ? 0.85 : 0.5) : 0.09} />
      </g>
    {/each}
    <!-- logo: bông sen 8 cánh ôm cán cân -->
    <g class="cg-logo" class:lit={!!c.logo} filter={c.logo ? `url(#${uid}-glow)` : undefined} transform="translate(428 262)">
      {#each Array(8) as _, k (k)}
        <path transform="rotate({k * 45})" d="M0 -30C13 -40 15 -62 0 -84C-15 -62 -13 -40 0 -30z" fill="none" stroke={c.logo ? ink(c.logo) : `url(#${uid}-gold)`} stroke-width="2.2" opacity={c.logo ? 0.95 : 0.55} />
      {/each}
      <circle r="98" fill="none" stroke={c.logo ? ink(c.logo) : `url(#${uid}-gold)`} stroke-width="1.2" stroke-dasharray="1 6" opacity=".6" />
      <g fill="none" stroke={c.logo ? ink(c.logo) : `url(#${uid}-gold)`} stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" opacity={c.logo ? 1 : 0.75}>
        <path d="M0 -22v44M-24 -12q24 -10 48 0M-24 -12q-7 10 -10 18q10 6 20 0q-3 -8 -10 -18M24 -12q7 10 10 18q-10 6 -20 0q3 -8 10 -18M-12 24q12 -6 24 0" />
        <circle cx="0" cy="-26" r="3.6" />
      </g>
    </g>
    <!-- chữ -->
    <text x="64" y="86" class="cg-head" fill="url(#{uid}-gold)">LUYỆN LUẬT</text>
    <text x="64" y="116" class="cg-sub">THẺ CHUYÊN CẦN</text>
    {#if c.tier}<text x="792" y="86" text-anchor="end" class="cg-tier" fill={ink(c.tier)}>{TIER_NAMES[c.tier]}</text><text x="792" y="116" text-anchor="end" class="cg-sub">NGÀY {c.day}/30</text>{/if}
    <text x="64" y="466" class="cg-num" fill="url(#{uid}-gold)">{pad(count)}</text>
    <text x="64" y="496" class="cg-sub">NGÀY CHUỖI</text>
    <text x="792" y="466" text-anchor="end" class="cg-num" fill="url(#{uid}-gold)">{pad(Math.max(longest, count))}</text>
    <text x="792" y="496" text-anchor="end" class="cg-sub">KỶ LỤC{#if c.record} · <tspan fill={ink(c.record)}>{TIER_NAMES[c.record].toUpperCase()}</tspan>{/if}</text>
    <!-- viền sáng (ngày 29) chỉ là ánh sáng mềm quanh mép, không phải khung -->
    {#if c.border}<rect x="3" y="3" width="850" height="534" rx="38" fill="none" stroke={ink(c.border)} stroke-width="3" opacity=".55" filter="url(#{uid}-glow)" />{/if}
    {#if c.burst}<rect width="856" height="540" rx="40" fill="url(#{uid}-holo)" class="cg-burst" />{/if}
  </svg>
  <span class="sc-glare" aria-hidden="true"></span>
</div>
