<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Thẻ chuyên cần — thẻ trơn bo tròn (không viền), 27 ký hoạ nằm trong đầu mây của ba dải vân mây kiểu chạm đình làng, sáng dần theo ngày;
  // logo bông sen 8 cánh ôm cán cân (không phải logo VBF, không Quốc huy). Rê chuột: thẻ nghiêng 3D + vệt sáng theo chuột
  // (học kỹ thuật biến CSS theo con trỏ của pokemon-cards-css (GPL-3.0) và vanilla-tilt (MIT) — tự viết, không chép mã).
  import { cardFor, TIER_NAMES, type Tier } from '$lib/game/card';
  import { CARD_GLYPHS } from './cardGlyphs';
  let { count = 0, longest = 0, size = 'full' }: { count?: number; longest?: number; size?: 'full' | 'mini' } = $props();
  const c = $derived(cardFor(count, longest));
  const uid = `sc${++seq}`;
  // Vân mây kiểu chạm đình làng / sơn son thiếp vàng: ba dải mây chạy ngang; mỗi "đầu mây" cuộn xoắn ôm một ký hoạ,
  // có hai cụm mây nhỏ trên đỉnh; "đuôi mây" là ba nét song song uốn nối sang đầu kế tiếp. Dải giữa chừa chỗ cho logo.
  type Head = { x: number; y: number; dir: 1 | -1; band: number };
  const heads: Head[] = [];
  const wave = (x: number, k: number) => Math.sin(x / 70 + k * 1.7) * 16;
  for (let i = 0; i < 10; i++) { const x = 34 + i * 87.5; heads.push({ x, y: 96 + wave(x, 0), dir: i % 2 ? -1 : 1, band: 0 }); }
  for (const x of [44, 122, 200, 276, 580, 656, 734, 812]) heads.push({ x, y: 268 + wave(x, 1), dir: x < 428 ? 1 : -1, band: 1 });
  for (let i = 0; i < 9; i++) { const x = 66 + i * 90.5; heads.push({ x, y: 444 + wave(x, 2), dir: i % 2 ? 1 : -1, band: 2 }); }
  const f = (n: number) => n.toFixed(1);
  // đường xoắn quanh ký hoạ: 1,3 vòng, bán kính 22 → 34, kết thúc ở phía dưới-phải (hoặc trái nếu dir = -1)
  function spiral(h: Head) {
    const end = Math.PI / 2 - h.dir * 0.5, turns = 2.6 * Math.PI, pts: string[] = [];
    for (let k = 0; k <= 40; k++) {
      const t = k / 40, ang = end - h.dir * turns * (1 - t), r = 21 + t * 13;
      pts.push(`${k ? 'L' : 'M'}${f(h.x + Math.cos(ang) * r)} ${f(h.y + Math.sin(ang) * r)}`);
    }
    return pts.join('');
  }
  // lọn xoắn con phía trên (đầu mây kép), quay ngược chiều đầu chính
  function curl(h: Head) {
    const cx = h.x - h.dir * 30, cy = h.y - 30, pts: string[] = [];
    for (let k = 0; k <= 24; k++) {
      const t = k / 24, ang = Math.PI * 0.25 + h.dir * 2.3 * Math.PI * (1 - t), r = 3.5 + t * 9;
      pts.push(`${k ? 'L' : 'M'}${f(cx + Math.cos(ang) * r)} ${f(cy + Math.sin(ang) * r)}`);
    }
    return pts.join('') + `Q${f(h.x - h.dir * 12)} ${f(h.y - 44)} ${f(h.x + h.dir * 6)} ${f(h.y - 35)}`;
  }
  // đuôi mây: ba nét song song lướt từ đáy đầu mây, luồn dưới đầu kế tiếp (đầu/cuối dải tràn ra mép thẻ)
  function tails(h: Head, prev: Head | undefined, n: Head | undefined) {
    const out: string[] = [];
    const sweep = (sx: number, sy: number, ex: number, ey: number) => [0, 6, 12].map((o) => {
      const dx = ex - sx;
      return `M${f(sx)} ${f(sy + o)}C${f(sx + dx * 0.35)} ${f(sy + o + 16)} ${f(ex - dx * 0.4)} ${f(ey + o - 14)} ${f(ex)} ${f(ey + o)}`;
    });
    if (n && n.band === h.band) out.push(...sweep(h.x + 6, h.y + 34, n.x + 18, n.y + 30));
    else out.push(...sweep(h.x + 6, h.y + 34, 900, h.y + 22));
    if (!prev || prev.band !== h.band) out.push(...sweep(-40, h.y + 40, h.x - 30, h.y + 26));
    return out;
  }
  // lớp xoắn lớn rất mờ phủ khoảng giữa các dải
  const ghosts = [[150, 182, 1], [330, 360, -1], [520, 172, 1], [706, 356, -1], [60, 520, 1], [800, 20, -1]].map(([x, y, d]) => {
    const pts: string[] = [];
    for (let k = 0; k <= 50; k++) { const t = k / 50, ang = d * 3.2 * Math.PI * t, r = 8 + t * 54; pts.push(`${k ? 'L' : 'M'}${f(x + Math.cos(ang) * r)} ${f(y + Math.sin(ang) * r)}`); }
    return pts.join('');
  });
  const clouds = heads.map((h, i) => ({ ...h, spiral: spiral(h), curl: curl(h), tails: tails(h, heads[i - 1], heads[i + 1]) }));
  // thứ tự sáng: từ giữa lan ra (ngày 1 gần logo nhất)
  const order = [...heads.keys()].sort((a, b) => Math.hypot(heads[a].x - 428, (heads[a].y - 268) * 1.6) - Math.hypot(heads[b].x - 428, (heads[b].y - 268) * 1.6));
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
      <filter id="{uid}-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <radialGradient id="{uid}-disc" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#2c2a28" /><stop offset="1" stop-color="#121214" /></radialGradient>
      <filter id="{uid}-emboss" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2.5" stdDeviation="1.6" flood-color="#000" flood-opacity=".75" /><feDropShadow dx="0" dy="-1" stdDeviation=".4" flood-color="#fff6d8" flood-opacity=".35" /></filter>
      <radialGradient id="{uid}-holeg" cx=".5" cy=".485" r=".5"><stop offset=".26" stop-color="#000" /><stop offset=".42" stop-color="#fff" /></radialGradient>
      <filter id="{uid}-feather"><feGaussianBlur stdDeviation="16" /></filter>
      <mask id="{uid}-hole" maskUnits="userSpaceOnUse" x="0" y="0" width="856" height="540">
        <rect width="856" height="540" fill="url(#{uid}-holeg)" />
      </mask>
      <filter id="{uid}-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
    </defs>
    <rect width="856" height="540" rx="40" fill="url(#{uid}-bg)" />
    <!-- quầng màu lửa mờ phía sau (đậm dần theo ngày) -->
    {#if c.tier}<ellipse cx="428" cy="268" rx={150 + c.day * 7} ry={90 + c.day * 4} fill={ink(c.tier)} opacity={0.05 + c.day * 0.004} filter="url(#{uid}-soft)" />{/if}
    <!-- ba dải vân mây; mỗi đầu mây ôm một ký hoạ ngành luật, sáng dần theo ngày (mờ quanh logo để logo nổi) -->
    <g mask="url(#{uid}-hole)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <g stroke="url(#{uid}-gold)" stroke-width="1" opacity=".08">{#each ghosts as d (d)}<path {d} />{/each}</g>
      {#each clouds as h, i (i)}
        {@const t = c.glyphs[rankOf[i]]}
        {@const col = t ? ink(t) : `url(#${uid}-gold)`}
        <g class="cg-glyph" class:lit={!!t} class:now={!!t && rankOf[i] === c.day - 1 && t === c.tier} stroke={col}
          opacity={t ? (t === c.tier ? 0.9 : 0.55) : 0.2} filter={t ? `url(#${uid}-glow)` : undefined}>
          <title>{CARD_GLYPHS[i].field}: {CARD_GLYPHS[i].name}</title>
          {#each h.tails as d, k (k)}<path {d} stroke-width={1.25 - (k % 3) * 0.3} opacity={1 - (k % 3) * 0.28} />{/each}
          <path d={h.spiral} stroke-width="1.5" />
          <path d={h.curl} stroke-width="1.1" />
          <g transform="translate({h.x - 15} {h.y - 15}) scale(1.25)"><path d={CARD_GLYPHS[i].d} stroke-width="1.15" /></g>
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
