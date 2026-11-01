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
  // lưới 9 × 3 so le phủ kín thẻ; ký hoạ to, chồng mép lên nhau để hoa văn đan vào nhau
  const pos = Array.from({ length: 27 }, (_, i) => {
    const row = Math.floor(i / 9), col = i % 9;
    const x = 48 + col * 95 + (row % 2) * 47, y = 96 + row * 172 + ((col * 13) % 3) * 8;
    return { x, y, s: 4 + ((i * 7) % 5) * 0.2, rot: ((i * 37) % 24) - 12 };
  });
  // thứ tự sáng: từ giữa lan ra hai bên (ngày 1 gần logo nhất)
  const order = [...pos.keys()].sort((a, b) => Math.hypot(pos[a].x - 428, (pos[a].y - 268) * 1.6) - Math.hypot(pos[b].x - 428, (pos[b].y - 268) * 1.6));
  const rankOf = Array(27).fill(0); order.forEach((g, k) => (rankOf[g] = k));
  // vân guilloche: các đường sóng chạy ngang thẻ
  const waves = Array.from({ length: 7 }, (_, k) => {
    let d = '';
    for (let x = 0; x <= 856; x += 8) { const y = 70 + k * 68 + Math.sin(x / 46 + k * 0.9) * 22 + Math.sin(x / 17 + k) * 4; d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`; }
    return d;
  });
  // hoa văn hoa thị (rosette) của huy hiệu: elip xoay lồng nhau
  const rosette = Array.from({ length: 36 }, (_, k) => k * 5);
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
      <radialGradient id="{uid}-disc" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#2c2a28" /><stop offset="1" stop-color="#121214" /></radialGradient>
      <filter id="{uid}-emboss" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2.5" stdDeviation="1.6" flood-color="#000" flood-opacity=".75" /><feDropShadow dx="0" dy="-1" stdDeviation=".4" flood-color="#fff6d8" flood-opacity=".35" /></filter>
      <radialGradient id="{uid}-holeg" cx=".5" cy=".485" r=".5"><stop offset=".26" stop-color="#000" /><stop offset=".42" stop-color="#fff" /></radialGradient>
      <filter id="{uid}-feather"><feGaussianBlur stdDeviation="16" /></filter>
      <mask id="{uid}-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="856" height="540">
        <rect width="856" height="540" fill="url(#{uid}-holeg)" />
        <g fill="#000" filter="url(#{uid}-feather)"><rect x="30" y="34" width="330" height="104" rx="20" /><rect x="610" y="34" width="216" height="104" rx="20" /><rect x="30" y="414" width="300" height="104" rx="20" /><rect x="526" y="414" width="300" height="104" rx="20" /></g>
      </mask>
      <filter id="{uid}-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect width="856" height="540" rx="40" fill="url(#{uid}-bg)" />
    <!-- quầng màu lửa mờ phía sau (đậm dần theo ngày) -->
    {#if c.tier}<ellipse cx="428" cy="268" rx={150 + c.day * 7} ry={90 + c.day * 4} fill={ink(c.tier)} opacity={0.05 + c.day * 0.004} filter="url(#{uid}-soft)" />{/if}
    <!-- vân guilloche -->
    <g fill="none" stroke="url(#{uid}-gold)" stroke-width="0.8" opacity=".14">{#each waves as d (d)}<path {d} />{/each}</g>
    <!-- 27 ký hoạ phủ nền (mờ quanh logo để logo nổi) -->
    <g mask="url(#{uid}-hole)">
      {#each CARD_GLYPHS as g, i (g.name)}
        {@const t = c.glyphs[rankOf[i]]}
        <g transform="translate({pos[i].x} {pos[i].y}) rotate({pos[i].rot}) scale({pos[i].s}) translate(-12 -12)" class="cg-glyph" class:lit={!!t} class:now={!!t && rankOf[i] === c.day - 1 && t === c.tier} filter={t ? `url(#${uid}-glow)` : undefined}>
          <title>{g.field}: {g.name}</title>
          <path d={g.d} fill="none" stroke={t ? ink(t) : `url(#${uid}-gold)`} stroke-width="0.42" stroke-linecap="round" stroke-linejoin="round" opacity={t ? (t === c.tier ? 0.9 : 0.55) : 0.13} />
        </g>
      {/each}
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
      <g filter="url(#{uid}-emboss)">
        {#each Array(8) as _, k (k)}<path transform="rotate({k * 45 + 22.5})" d="M0 -22C9 -28 11 -42 0 -56C-11 -42 -9 -28 0 -22z" fill={c.logo ? ink(c.logo) : `url(#${uid}-gold)`} opacity=".9" />{/each}
        <g fill="none" stroke={c.logo ? ink(c.logo) : `url(#${uid}-gold)`} stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round">
          <path d="M0 -18v38M-22 -9q22 -9 44 0M-22 -9q-6 9 -9 16q9 6 18 0q-3 -7 -9 -16M22 -9q6 9 9 16q-9 6 -18 0q3 -7 9 -16M-11 20q11 -5 22 0" />
        </g>
        <circle cy="-22" r="4" fill={c.logo ? ink(c.logo) : `url(#${uid}-gold)`} />
      </g>
      {#if c.logo}<circle r="104" fill="none" stroke={ink(c.logo)} stroke-width="3" opacity=".7" filter="url(#{uid}-glow)" />{/if}
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
