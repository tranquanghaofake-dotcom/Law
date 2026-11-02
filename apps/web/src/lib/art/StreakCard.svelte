<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Thẻ chuyên cần — thẻ trơn bo tròn (không viền), 27 doodle nét đơn về pháp luật phủ kín nền, có hình phụ lấp khe, sáng dần theo ngày;
  // logo bông sen 8 cánh ôm cán cân (không phải logo VBF, không Quốc huy). Rê chuột: thẻ nghiêng 3D + vệt sáng theo chuột
  // (học kỹ thuật biến CSS theo con trỏ của pokemon-cards-css (GPL-3.0) và vanilla-tilt (MIT) — tự viết, không chép mã).
  import { cardFor, TIER_NAMES, type Tier } from '$lib/game/card';
  import { CARD_GLYPHS } from './cardGlyphs';
  let { count = 0, longest = 0, size = 'full' }: { count?: number; longest?: number; size?: 'full' | 'mini' } = $props();
  const c = $derived(cardFor(count, longest));
  const uid = `sc${++seq}`;
  // Nền doodle nét đơn phủ kín: 27 doodle pháp luật xếp 4 hàng so le (7 + 6 + 6 + 8), hai hàng giữa chừa chỗ logo;
  // khe trống lấp bằng hình phụ nhỏ (chấm, sao, xoắn, §, gạch). Lệch vị trí/góc nhẹ cho cảm giác vẽ tay.
  const jit = (i: number, k: number) => (((i * 9301 + k * 49297) % 233280) / 233280 - 0.5);
  const slots: [number, number][] = [
    ...Array.from({ length: 7 }, (_, i) => [74 + i * 118, 78] as [number, number]),
    ...[48, 150, 252, 604, 706, 808].map((x) => [x, 206] as [number, number]),
    ...[86, 188, 286, 570, 672, 774].map((x) => [x, 334] as [number, number]),
    ...Array.from({ length: 8 }, (_, i) => [54 + i * 107, 466] as [number, number]),
  ];
  const doodles = slots.map(([x, y], i) => ({ x: x + jit(i, 1) * 16, y: y + jit(i, 2) * 12, rot: jit(i, 3) * 22, s: 1.32 + jit(i, 4) * 0.14 }));
  // hình phụ lấp khe
  const FILL = [
    'M0-4v8M-4 0h8', 'M0-5l1.4 3.6l3.6 1.4l-3.6 1.4l-1.4 3.6l-1.4-3.6l-3.6-1.4l3.6-1.4z', 'M-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
    'M-6 0q3-4 6 0t6 0', 'M2-3q-2-2-4 0q-2 3 2 3t2 3q-2 2-4 0', 'M0 0a2 2 0 1 1 2 2a4 4 0 1 1-4-4a6 6 0 1 1 6 6', 'M-4 2l4-4l4 4', 'M-.6 0a.6 .6 0 1 0 1.2 0a.6 .6 0 1 0-1.2 0',
  ];
  const fillers: { x: number; y: number; d: string; rot: number }[] = [];
  for (let gy = 0; gy < 12; gy++) for (let gx = 0; gx < 19; gx++) {
    const k = gy * 19 + gx, x = 22 + gx * 45 + jit(k, 5) * 22 + (gy % 2) * 22, y = 20 + gy * 46 + jit(k, 6) * 18;
    if (Math.hypot(x - 428, (y - 262) * 1.15) < 150) continue;
    if (doodles.some((d) => Math.abs(d.x - x) < 52 && Math.abs(d.y - y) < 50)) continue;
    fillers.push({ x, y, d: FILL[Math.abs(Math.floor(jit(k, 7) * 1000)) % FILL.length], rot: jit(k, 8) * 60 });
  }
  // thứ tự sáng: từ giữa lan ra (ngày 1 gần logo nhất)
  const order = [...doodles.keys()].sort((a, b) => Math.hypot(doodles[a].x - 428, (doodles[a].y - 268) * 1.6) - Math.hypot(doodles[b].x - 428, (doodles[b].y - 268) * 1.6));
  const rankOf = Array(27).fill(0); order.forEach((g, k) => (rankOf[g] = k));
  // hoa văn hoa thị (rosette) của huy hiệu: elip xoay lồng nhau
  const rosette = Array.from({ length: 36 }, (_, k) => k * 5);
  const label = $derived(count > 0 ? `Thẻ chuyên cần: chuỗi ${count} ngày, ngày ${c.day}/30, màu ${TIER_NAMES[c.tier as Tier]}` : 'Thẻ chuyên cần: chưa có chuỗi');
  const INK: Record<Tier, string> = { do: '#ff9b7a', lam: '#8fd0ff', tim: '#d2adff', trang: '#ffffff', den: '#f2cf6b', 'vo-cuc': `url(#${uid}-holo)` };
  const ink = (t: Tier | null) => (t ? INK[t] : '#ffffff');
  const caption = $derived([c.tier ? `${TIER_NAMES[c.tier]} · ngày ${c.day}/30` : 'Chưa bắt đầu chuỗi', `chuỗi ${count} ngày`, `kỷ lục ${Math.max(longest, count)} ngày${c.record ? ` (${TIER_NAMES[c.record]})` : ''}`].join(' · '));
  const lf = $derived(c.logo ? ink(c.logo) : `url(#${uid}-gold)`);
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
      <filter id="{uid}-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <radialGradient id="{uid}-disc" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#2c2a28" /><stop offset="1" stop-color="#121214" /></radialGradient>
      <filter id="{uid}-emboss" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2.5" stdDeviation="1.6" flood-color="#000" flood-opacity=".75" /><feDropShadow dx="0" dy="-1" stdDeviation=".4" flood-color="#fff6d8" flood-opacity=".35" /></filter>
      <radialGradient id="{uid}-holeg" cx=".5" cy=".485" r=".5"><stop offset=".26" stop-color="#000" /><stop offset=".42" stop-color="#fff" /></radialGradient>
      <filter id="{uid}-feather"><feGaussianBlur stdDeviation="16" /></filter>
      <mask id="{uid}-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="856" height="540">
        <rect width="856" height="540" fill="url(#{uid}-holeg)" />
      </mask>
      <filter id="{uid}-hand" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7" /><feDisplacementMap in="SourceGraphic" scale="2.2" /></filter>
      <filter id="{uid}-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect width="856" height="540" rx="40" fill="url(#{uid}-bg)" />
    <!-- quầng màu lửa mờ phía sau (đậm dần theo ngày) -->
    {#if c.tier}<ellipse cx="428" cy="268" rx={150 + c.day * 7} ry={90 + c.day * 4} fill={ink(c.tier)} opacity={0.05 + c.day * 0.004} filter="url(#{uid}-soft)" />{/if}
    <!-- nền doodle: 27 hình pháp luật sáng dần theo ngày + hình phụ lấp khe; nét rung nhẹ như vẽ tay; mờ quanh logo -->
    <g mask="url(#{uid}-hole)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g filter="url(#{uid}-hand)">
        <g stroke="url(#{uid}-gold)" stroke-width=".9" opacity=".24">
          {#each fillers as fl, i (i)}<path d={fl.d} transform="translate({fl.x.toFixed(1)} {fl.y.toFixed(1)}) rotate({fl.rot.toFixed(0)}) scale(1.5)" />{/each}
        </g>
        {#each doodles as dd, i (i)}
          {@const t = c.glyphs[rankOf[i]]}
          <g class="cg-glyph" class:lit={!!t} class:now={!!t && rankOf[i] === c.day - 1 && t === c.tier}
            transform="translate({dd.x.toFixed(1)} {dd.y.toFixed(1)}) rotate({dd.rot.toFixed(1)}) scale({dd.s.toFixed(2)}) translate(-32 -32)"
            stroke={t ? ink(t) : `url(#${uid}-gold)`} opacity={t ? (t === c.tier ? 0.95 : 0.55) : 0.26} filter={t ? `url(#${uid}-glow)` : undefined}>
            <title>{CARD_GLYPHS[i].field}: {CARD_GLYPHS[i].name}</title>
            <path d={CARD_GLYPHS[i].d} stroke-width="1.3" />
          </g>
        {/each}
      </g>
    </g>
    <!-- huy hiệu: rosette guilloche + vành chấm + bông sen ôm cán cân, vàng kim nổi khối -->
    <g transform="translate(428 262)" class="cg-logo" class:lit={!!c.logo}>
      <circle r="112" fill="#0f0f12" opacity=".75" filter="url(#{uid}-soft)" />
      <circle r="104" fill="url(#{uid}-disc)" stroke="url(#{uid}-gold)" stroke-width="2.5" />
      <g fill="none" stroke={c.logo ? ink(c.logo) : `url(#${uid}-gold)`} stroke-width=".9" opacity={c.logo ? 0.8 : 0.5} filter={c.logo ? `url(#${uid}-glow)` : undefined}>
        {#each rosette as a (a)}<ellipse rx="96" ry="34" transform="rotate({a})" />{/each}
      </g>
      <circle r="66" fill="url(#{uid}-disc)" stroke="url(#{uid}-gold)" stroke-width="2" />
      <circle r="60" fill="none" stroke="url(#{uid}-gold)" stroke-width="1" stroke-dasharray="1 4" />
      <g filter="url(#{uid}-emboss)" transform="translate(0 6)">
        <!-- đài sen nghiêng 5 cánh -->
        <path d="M-4 34C-34 32-48 16-48 2C-30 2-14 14-4 34Z" fill={lf} opacity=".7" /><path d="M4 34C34 32 48 16 48 2C30 2 14 14 4 34Z" fill={lf} opacity=".7" />
        <path d="M-2 34C-24 26-30 6-24-12C-12-2-4 14-2 34Z" fill={lf} opacity=".85" /><path d="M2 34C24 26 30 6 24-12C12-2 4 14 2 34Z" fill={lf} opacity=".85" />
        <path d="M0 34C-13 18-13-2 0-20C13-2 13 18 0 34Z" fill={lf} />
        <path d="M0 30V-6M-30 34Q0 46 30 34" fill="none" stroke="#141414" stroke-width="1.2" opacity=".5" />
        <!-- cán cân mọc lên từ cánh giữa, đĩa cân lơ lửng trên hai cánh bên -->
        <g fill="none" stroke={lf} stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M0 -20V-46M-34 -40Q0 -50 34 -40M-34 -40l-8 16M-34 -40l8 16M34 -40l-8 16M34 -40l8 16" />
          <path d="M-44 -24Q-34 -14 -24 -24zM24 -24Q34 -14 44 -24z" fill={lf} />
        </g>
        <circle cy="-50" r="4.4" fill={lf} />
      </g>
      {#if c.logo}<circle r="104" fill="none" stroke={ink(c.logo)} stroke-width="3" opacity=".7" filter="url(#{uid}-glow)" />{/if}
    </g>
    <!-- viền sáng (ngày 29) chỉ là ánh sáng mềm quanh mép, không phải khung -->
    {#if c.border}<rect x="3" y="3" width="850" height="534" rx="38" fill="none" stroke={ink(c.border)} stroke-width="3" opacity=".55" filter="url(#{uid}-glow)" />{/if}
    {#if c.burst}<rect width="856" height="540" rx="40" fill="url(#{uid}-holo)" class="cg-burst" />{/if}
  </svg>
  <span class="sc-glare" aria-hidden="true"></span>
</div>
{#if size === 'full'}
  <p class="sc-caption">{caption}</p>
{/if}
