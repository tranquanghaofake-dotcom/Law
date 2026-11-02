<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Thẻ chuyên cần — thẻ trơn bo tròn (không viền), 27 doodle nét đơn về pháp luật phủ kín nền, có hình phụ lấp khe, sáng dần theo ngày;
  // logo bông sen 8 cánh ôm cán cân (không phải logo VBF, không Quốc huy). Rê chuột: thẻ nghiêng 3D + vệt sáng theo chuột
  // (học kỹ thuật biến CSS theo con trỏ của pokemon-cards-css (GPL-3.0) và vanilla-tilt (MIT) — tự viết, không chép mã).
  import { cardFor, justLit, isMilestone, TIER_NAMES, type Tier } from '$lib/game/card';
  import { CARD_GLYPHS } from './cardGlyphs';
  let { count = 0, longest = 0, size = 'full', ignite = false }: { count?: number; longest?: number; size?: 'full' | 'mini'; ignite?: boolean } = $props();
  const c = $derived(cardFor(count, longest));
  const uid = `sc${++seq}`;
  // Nền doodle nét đơn phủ kín: 27 doodle pháp luật xếp 4 hàng so le (7 + 6 + 6 + 8), hai hàng giữa chừa chỗ logo;
  // khe trống lấp bằng hình phụ nhỏ (chấm, sao, xoắn, §, gạch). Lệch vị trí/góc nhẹ cho cảm giác vẽ tay.
  const jit = (i: number, k: number) => (((i * 9301 + k * 49297) % 233280) / 233280 - 0.5);
  const slots: [number, number][] = [
    ...Array.from({ length: 7 }, (_, i) => [74 + i * 118, 78] as [number, number]),
    ...[40, 138, 232, 624, 718, 816].map((x) => [x, 206] as [number, number]),
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
  // cán cân của huy hiệu (gốc toạ độ = tâm đĩa số): cột xuyên qua đĩa, đòn cân và hai đĩa cân phía trên, đế phía dưới
  const SCALE = 'M0-124V-60M0 60V112M-124-92Q0-108 124-92M-124-92L-146-34M-124-92L-102-34M124-92L102-34M124-92L146-34M-46 112H46M-64 124H64M-14-96Q0-103 14-96';
  const PANS = 'M-152-34Q-124-12-96-34ZM96-34Q124-12 152-34Z';
  const label = $derived(count > 0 ? `Thẻ chuyên cần: chuỗi ${count} ngày, tiến độ ${c.day}/30, màu ${TIER_NAMES[c.tier as Tier]}` : 'Thẻ chuyên cần: chưa có chuỗi');
  // Lửa ba lớp (theo video Hào gửi): lõi gần trắng, thân màu bão hoà, quầng rộng rung như lửa/điện trên nền tối.
  type Fire = { core: string; mid: string; glow: string };
  const FIRE: Record<Tier, Fire> = {
    do: { core: '#fff4b8', mid: '#ffa32a', glow: '#e3300b' },
    lam: { core: '#effbff', mid: '#38b6ff', glow: '#0a5cff' },
    tim: { core: '#f8edff', mid: '#b65cff', glow: '#7417ff' },
    // trắng–đen giao thoa: lửa trắng bạc, có vệt đen chạy dọc nét (xem lớp .cg-inter)
    'trang-den': { core: '#ffffff', mid: '#eef3fa', glow: '#8ea4bf' },
  };

  const fire = (t: Tier) => FIRE[t];
  const ink = (t: Tier | null) => (t ? FIRE[t].mid : '#ffffff');
  const cur = $derived(c.tier ? FIRE[c.tier] : null);
  const litNow = $derived(doodles.map((_, i) => c.glyphs[rankOf[i]]).map((t) => (t && t === c.tier ? t : null)));
  const embers = $derived(doodles.flatMap((dd, i) => (litNow[i] && rankOf[i] === c.day - 1 ? [0, 1, 2, 3].map((k) => ({ x: dd.x + jit(i, 10 + k) * 40, y: dd.y + 10 + jit(i, 12 + k) * 20, d: (jit(i, 14 + k) + 0.5) * 3, i })) : [])));
  const bolts = Array.from({ length: 8 }, (_, k) => {
    const a = (k / 8) * Math.PI * 2 + 0.3; let d = '';
    for (let j = 0; j <= 6; j++) { const r = 150 - j * 11, w = j % 2 ? 7 : -7, aa = a + (w / r); d += `${j ? 'L' : 'M'}${(Math.cos(aa) * r).toFixed(1)} ${(Math.sin(aa) * r * 0.82).toFixed(1)}`; }
    return d;
  });
  const best = $derived(Math.max(longest, count));
  const caption = $derived([c.tier ? `${TIER_NAMES[c.tier]} · ${c.day}/30` : 'Chưa bắt đầu chuỗi', `chuỗi ${count} ngày${isMilestone(count) ? ' · mốc +1' : ''}`,
    `kỷ lục ${best}${c.record && c.record !== c.tier ? ` (${TIER_NAMES[c.record]})` : ''}`].join(' · '));
  const lf = $derived(c.logo ? `url(#${uid}-lotus)` : `url(#${uid}-ash)`);
  const lg = $derived(c.logo ? FIRE[c.logo] : null);
  const fs = $derived(String(count).length >= 3 ? 40 : 54);
  // Rê chuột: độ nghiêng chạy theo lò xo (mỗi khung hình tiến 12% về đích) nên mượt, có quán tính; lớp doodle trôi ngược
  // chiều (parallax), logo nổi lên. Rời chuột: trôi êm về giữa rồi dừng vòng lặp.
  let el: HTMLDivElement | undefined = $state();
  let on = $state(false);
  let pos = $state({ x: 0.5, y: 0.5 });
  let target = { x: 0.5, y: 0.5 };
  let raf = 0;
  function step() {
    const nx = pos.x + (target.x - pos.x) * 0.12, ny = pos.y + (target.y - pos.y) * 0.12;
    pos = { x: nx, y: ny };
    raf = Math.abs(target.x - nx) + Math.abs(target.y - ny) > 0.001 ? requestAnimationFrame(step) : 0;
  }
  const kick = () => { if (!raf && typeof requestAnimationFrame !== 'undefined') raf = requestAnimationFrame(step); };
  function move(e: PointerEvent) {
    if (size === 'mini' || !el) return;
    const b = el.getBoundingClientRect();
    target = { x: (e.clientX - b.left) / b.width, y: (e.clientY - b.top) / b.height }; on = true; kick();
  }
  function leave() { target = { x: 0.5, y: 0.5 }; on = false; kick(); }
  $effect(() => () => { if (raf) cancelAnimationFrame(raf); });
  const tilt = $derived({ rx: (0.5 - pos.y) * 14, ry: (pos.x - 0.5) * 18, mx: pos.x * 100, my: pos.y * 100, px: (pos.x - 0.5) * 2, py: (pos.y - 0.5) * 2 });

  // Vừa thắp chuỗi: so với chuỗi đã xem lần trước (localStorage, chỉ là tiện ích hiển thị) → tia lửa bay từ logo tới
  // ký hoạ mới, ký hoạ bùng cháy, sóng lửa lan ra; ngày không có ký hoạ mới (28–30) thì sóng lớn quanh logo. `ignite` ép chạy.
  const SEEN = 'll-card-seen';
  let lighting = $state(false);
  $effect(() => {
    if (size === 'mini') return;
    let seen: number | null = null;
    try { const v = localStorage.getItem(SEEN); seen = v === null ? null : Number(v); localStorage.setItem(SEEN, String(count)); } catch { /* bỏ qua */ }
    if (!(ignite || justLit(count, seen))) return;
    lighting = true;
    const t = setTimeout(() => (lighting = false), 2600);
    return () => clearTimeout(t);
  });
  const newest = $derived(c.day >= 1 && c.day <= 27 ? order[c.day - 1] : -1);
  const spark = $derived(newest >= 0 ? { x: doodles[newest].x, y: doodles[newest].y } : { x: 428, y: 262 });
</script>

<div class="sc-wrap {size}" class:on class:lighting bind:this={el} onpointermove={move} onpointerleave={leave} role="img" aria-label={label}
  style="--rx:{tilt.rx.toFixed(2)}deg; --ry:{tilt.ry.toFixed(2)}deg; --mx:{tilt.mx.toFixed(1)}%; --my:{tilt.my.toFixed(1)}%; --px:{tilt.px.toFixed(3)}; --py:{tilt.py.toFixed(3)}">
  <svg class="streak-card {size} tier-{c.tier ?? 'none'}" class:burst={c.burst} viewBox="0 0 856 540" aria-hidden="true" focusable="false">
    <defs>
      <radialGradient id="{uid}-bg" cx=".3" cy=".2" r="1.1"><stop offset="0" stop-color="#34343a" /><stop offset=".55" stop-color="#1b1b20" /><stop offset="1" stop-color="#0d0d10" /></radialGradient>
      <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b8924a" /><stop offset=".45" stop-color="#f6e2a8" /><stop offset=".6" stop-color="#d9b56a" /><stop offset="1" stop-color="#8e6c2c" /></linearGradient>
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
      <!-- lửa: làm nhoè rồi xé mép bằng nhiễu chuyển động, cộng quầng rộng -->
      <clipPath id="{uid}-clip"><rect width="856" height="540" rx="40" /></clipPath>
      <linearGradient id="{uid}-sheen" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0" /><stop offset=".5" stop-color="#fff" stop-opacity=".09" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></linearGradient>
      <linearGradient id="{uid}-edge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22" /><stop offset=".35" stop-color="#fff" stop-opacity=".04" /><stop offset="1" stop-color="#000" stop-opacity=".5" /></linearGradient>
      <filter id="{uid}-flame" x="-6%" y="-12%" width="112%" height="124%">
        <feTurbulence type="fractalNoise" baseFrequency=".016 .06" numOctaves="3" seed="3" result="n">
          <animate attributeName="baseFrequency" dur="2.4s" values=".016 .06;.02 .08;.014 .05;.016 .06" repeatCount="indefinite" />
        </feTurbulence>
        <feGaussianBlur in="SourceGraphic" stdDeviation="2.6" result="b" />
        <feDisplacementMap in="b" in2="n" scale="18" xChannelSelector="R" yChannelSelector="G" result="f" />
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="bloom" />
        <feMerge><feMergeNode in="bloom" /><feMergeNode in="f" /><feMergeNode in="f" /></feMerge>
      </filter>
      <filter id="{uid}-hot" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="1.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      {#if cur}<radialGradient id="{uid}-aura"><stop offset="0" stop-color={cur.glow} stop-opacity=".32" /><stop offset=".6" stop-color={cur.glow} stop-opacity=".08" /><stop offset="1" stop-color={cur.glow} stop-opacity="0" /></radialGradient>{/if}
      <linearGradient id="{uid}-ash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a9aa0" /><stop offset="1" stop-color="#4b4b52" /></linearGradient>
      {#if lg}<radialGradient id="{uid}-lotus" cx=".5" cy=".35" r=".75"><stop offset="0" stop-color={lg.core} /><stop offset=".45" stop-color={lg.mid} /><stop offset="1" stop-color={lg.glow} /></radialGradient>{/if}
    </defs>
    <rect width="856" height="540" rx="40" fill="url(#{uid}-bg)" />
    <!-- quầng màu lửa mờ phía sau (đậm dần theo ngày) -->
    {#if cur}<ellipse class="cg-aura" cx="428" cy="268" rx={170 + c.day * 7} ry={110 + c.day * 4} fill="url(#{uid}-aura)" opacity={0.2 + c.day * 0.006} />{/if}
    <!-- nền doodle: 27 hình pháp luật sáng dần theo ngày + hình phụ lấp khe; nét rung nhẹ như vẽ tay; mờ quanh logo -->
    <g class="cg-par-bg" mask="url(#{uid}-hole)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g filter="url(#{uid}-hand)">
        <g stroke="url(#{uid}-gold)" stroke-width=".9" opacity=".09">
          {#each fillers as fl, i (i)}<path d={fl.d} transform="translate({fl.x.toFixed(1)} {fl.y.toFixed(1)}) rotate({fl.rot.toFixed(0)}) scale(1.5)" />{/each}
        </g>
        {#each doodles as dd, i (i)}
          {@const t = c.glyphs[rankOf[i]]}
          {#if !litNow[i]}
            <g class="cg-glyph" class:lit={!!t} transform="translate({dd.x.toFixed(1)} {dd.y.toFixed(1)}) rotate({dd.rot.toFixed(1)}) scale({dd.s.toFixed(2)}) translate(-32 -32)">
              <title>{CARD_GLYPHS[i].field}: {CARD_GLYPHS[i].name}</title>
              {#if t}<path d={CARD_GLYPHS[i].d} stroke={fire(t).mid} stroke-width="1.6" opacity=".28" /><path d={CARD_GLYPHS[i].d} stroke={fire(t).core} stroke-width=".7" opacity=".3" />
              {:else}<path d={CARD_GLYPHS[i].d} stroke="url(#{uid}-gold)" stroke-width="1.2" opacity=".2" />{/if}
            </g>
          {/if}
        {/each}
      </g>
      {#if cur}
        <!-- phân cấp ánh sáng: chỉ ký hoạ hôm nay có quầng lửa; các ký hoạ đã thắp khác âm ỉ như than hồng -->
        <g class="cg-flames" filter="url(#{uid}-flame)" stroke={cur.glow} stroke-width="4">
          {#each doodles as dd, i (i)}{#if litNow[i] && rankOf[i] === c.day - 1}<path d={CARD_GLYPHS[i].d} transform="translate({dd.x.toFixed(1)} {dd.y.toFixed(1)}) rotate({dd.rot.toFixed(1)}) scale({dd.s.toFixed(2)}) translate(-32 -32)" />{/if}{/each}
        </g>
        <g filter="url(#{uid}-hot)">
          {#each doodles as dd, i (i)}
            {#if litNow[i]}
              <g transform="translate({dd.x.toFixed(1)} {dd.y.toFixed(1)}) rotate({dd.rot.toFixed(1)}) scale({dd.s.toFixed(2)}) translate(-32 -32)">
                <g class="cg-glyph lit" class:now={rankOf[i] === c.day - 1} style="--k:{i}">
                  <title>{CARD_GLYPHS[i].field}: {CARD_GLYPHS[i].name}</title>
                  {#if rankOf[i] === c.day - 1}
                    <path d={CARD_GLYPHS[i].d} stroke={cur.mid} stroke-width="2.4" /><path d={CARD_GLYPHS[i].d} stroke={cur.core} stroke-width="1.1" />
                    {#if c.tier === 'trang-den'}<path class="cg-inter" d={CARD_GLYPHS[i].d} stroke="#050507" stroke-width="1.6" />{/if}
                  {:else}
                    <path d={CARD_GLYPHS[i].d} stroke={cur.mid} stroke-width="1.6" opacity=".75" /><path d={CARD_GLYPHS[i].d} stroke={cur.core} stroke-width=".7" opacity=".55" />
                    {#if c.tier === 'trang-den'}<path class="cg-inter slow" d={CARD_GLYPHS[i].d} stroke="#050507" stroke-width="1.1" />{/if}
                  {/if}
                </g>
              </g>
            {/if}
          {/each}
        </g>
        <!-- tàn lửa bay lên -->
        <g fill={cur.core} stroke="none" filter="url(#{uid}-hot)">
          {#each embers as e, k (k)}<circle class="cg-ember" cx={e.x.toFixed(1)} cy={e.y.toFixed(1)} r={1.4 + (k % 3) * 0.5} style="animation-delay:-{e.d.toFixed(2)}s; --c:{cur.glow}" />{/each}
        </g>
      {/if}
    </g>
    <!-- huy hiệu (theo phác thảo của Hào): cán cân lớn tràn ra ngoài vòng tròn, trong vòng tròn là số ngày của chuỗi.
         Xám khi chưa thắp; ngày 29 tia điện tụ về; ngày 30 thắp cuối cùng — cán cân cháy ba lớp, vòng lửa quanh đĩa số. -->
    <g class="cg-par-fg" class:born={!!c.logo}><g transform="translate(428 262)" class="cg-logo" class:lit={!!c.logo} class:charge={!!c.charge}>
      <ellipse rx="190" ry="170" fill="#0f0f12" opacity=".7" filter="url(#{uid}-soft)" />
      {#if c.charge}
        <g class="cg-bolts" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#{uid}-hot)">
          {#each bolts as d, k (k)}<path {d} stroke={fire(c.charge).mid} stroke-width="4" style="animation-delay:{(k * 0.37).toFixed(2)}s" /><path {d} stroke={fire(c.charge).core} stroke-width="1.6" style="animation-delay:{(k * 0.37).toFixed(2)}s" />{/each}
        </g>
      {/if}
      <!-- cán cân: quầng lửa (khi thắp) → thân → lõi; chưa thắp thì xám nổi khối -->
      {#if lg}<g class="cg-ring" fill="none" stroke={lg.glow} stroke-width="7" stroke-linecap="round" stroke-linejoin="round" filter="url(#{uid}-flame)"><path d={SCALE} /><circle r="66" /></g>{/if}
      <g fill="none" stroke-linecap="round" stroke-linejoin="round" filter={lg ? `url(#${uid}-hot)` : `url(#${uid}-emboss)`}>
        <path d={SCALE} stroke={lg ? lg.mid : '#7a7a82'} stroke-width={lg ? 4.2 : 4.6} />
        <path d={PANS} fill={lg ? lg.mid : '#5a5a62'} fill-opacity={lg ? 0.35 : 0.6} stroke={lg ? lg.mid : '#7a7a82'} stroke-width="3" />
        {#if lg}<path d={SCALE} stroke={lg.core} stroke-width="1.6" /><path d={PANS} stroke={lg.core} stroke-width="1.2" />{/if}
        {#if c.logo === 'trang-den'}<path class="cg-inter" d={SCALE} stroke="#050507" stroke-width="2.2" />{/if}
        <circle cy="-129" r="6" fill={lg ? lg.core : '#8a8a92'} stroke="none" />
      </g>
      <!-- vòng hoa văn + đĩa số -->
      <g class="cg-rosette" fill="none" stroke={lg ? lg.mid : '#76767e'} stroke-width=".8" opacity={lg ? 0.38 : 0.22}>
        {#each rosette as a (a)}<ellipse rx="80" ry="27" transform="rotate({a})" />{/each}
      </g>
      {#if c.charge}<circle r="66" fill="none" stroke={fire(c.charge).glow} stroke-width="3" opacity=".6" class="cg-charge" filter="url(#{uid}-hot)" />{/if}
      <circle r="60" fill="url(#{uid}-disc)" stroke={lg ? lg.core : '#5e5e66'} stroke-width="2.4" />
      <circle r="53" fill="none" stroke={lg ? lg.mid : '#55555c'} stroke-width="1" stroke-dasharray="1 4" />
      {#if lg}<circle r="40" fill={lg.glow} opacity=".3" filter="url(#{uid}-soft)" class="cg-core" />{/if}
      <!-- số khắc chìm: bóng tối lệch xuống + viền sáng mảnh lệch lên, rồi chữ chính -->
      <text class="cg-count" y="2.4" text-anchor="middle" dominant-baseline="central" font-size={fs} fill="#000" opacity=".6">{count}</text>
      <text class="cg-count" y="-.6" text-anchor="middle" dominant-baseline="central" font-size={fs} fill="#fff" opacity=".18">{count}</text>
      <text class="cg-count" y="1" text-anchor="middle" dominant-baseline="central" font-size={fs}
        fill={lg ? `url(#${uid}-lotus)` : `url(#${uid}-ash)`} filter={lg ? `url(#${uid}-hot)` : undefined}>{count}</text>
    </g></g>
    <!-- màn vừa thắp: tia lửa bay từ logo tới ký hoạ mới → bùng cháy + sóng lửa; ngày 28–30 thì sóng lớn quanh logo -->
    {#if lighting && cur}
      <g class="cg-light" fill="none" pointer-events="none">
        {#if newest >= 0}
          <circle class="cg-spark tail" cx="428" cy="262" r="10" fill={cur.glow} opacity=".6" filter="url(#{uid}-soft)" style="--dx:{(spark.x - 428).toFixed(1)}px; --dy:{(spark.y - 262).toFixed(1)}px" />
          <circle class="cg-spark" cx="428" cy="262" r="5" fill={cur.core} filter="url(#{uid}-hot)" style="--dx:{(spark.x - 428).toFixed(1)}px; --dy:{(spark.y - 262).toFixed(1)}px" />
          <circle class="cg-flash" cx={spark.x.toFixed(1)} cy={spark.y.toFixed(1)} r="46" fill={cur.glow} filter="url(#{uid}-soft)" />
          <circle class="cg-wave" cx={spark.x.toFixed(1)} cy={spark.y.toFixed(1)} r="40" stroke={cur.mid} stroke-width="3" filter="url(#{uid}-hot)" />
        {:else}
          <circle class="cg-flash big" cx="428" cy="262" r="130" fill={cur.glow} filter="url(#{uid}-soft)" />
          <circle class="cg-wave big" cx="428" cy="262" r="110" stroke={cur.mid} stroke-width="4" filter="url(#{uid}-hot)" />
        {/if}
      </g>
    {/if}
    <!-- viền sáng (ngày 29) chỉ là ánh sáng mềm quanh mép, không phải khung -->
    {#if c.border}
      {#if c.border === c.tier && c.day >= 28}<rect x="4" y="4" width="848" height="532" rx="37" fill="none" stroke={fire(c.border).glow} stroke-width="3.5" opacity=".75" filter="url(#{uid}-flame)" class="cg-border" />{/if}
      <rect x="3" y="3" width="850" height="534" rx="38" fill="none" stroke={fire(c.border).mid} stroke-width="1.2" opacity=".55" />
    {/if}
    {#if c.burst}<rect width="856" height="540" rx="40" fill="url(#{uid}-aura)" class="cg-burst tint" />{/if}
    <!-- chất liệu thẻ: vệt sáng lướt chéo định kỳ + cạnh kim loại mảnh -->
    {#if size === 'full'}
      <g clip-path="url(#{uid}-clip)" pointer-events="none"><rect class="cg-sheen" x="-260" y="-60" width="200" height="660" fill="url(#{uid}-sheen)" transform="rotate(18 0 270)" /></g>
    {/if}
    <rect x="1.5" y="1.5" width="853" height="537" rx="39" fill="none" stroke="url(#{uid}-edge)" stroke-width="1.6" />
  </svg>
  <span class="sc-glare" aria-hidden="true"></span>
</div>
{#if size === 'full'}
  <p class="sc-caption">{caption}</p>
{/if}
