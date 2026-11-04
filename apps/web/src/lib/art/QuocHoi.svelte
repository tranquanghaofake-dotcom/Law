<!-- Toà nghị viện (cảm hứng Nhà Quốc hội — cách điệu): cột trụ và khối trụ tô gradient ngang, tường kính phản chiếu và ánh đèn ấm, bóng mái hiên, bậc thềm sáng–tối,
     hồ phản chiếu, mây trôi/đèn nhấp nháy (tắt khi giảm chuyển động). Lớp xa–gần, vân giấy do kit/ (SceneBack, SceneFront) lo. Khung 520×325. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  const cols = Array.from({ length: 15 }, (_, i) => 120 + i * 20);
  const fins = Array.from({ length: 14 }, (_, i) => 192 + i * 10.5);
  const mull = Array.from({ length: 15 }, (_, i) => 112 + i * 21.1);
  let meander = ''; for (let x = 104; x < 416; x += 12) meander += `M${x} 147v-6h6v4h-3`;
  // đường nét phố xa
  const skyline = [[8, 30], [26, 44], [44, 26], [60, 52], [80, 34], [440, 36], [460, 54], [482, 30], [500, 46]];
  // tiết diện lát sân (đường hội tụ)
  let paving = ''; for (let i = -6; i <= 6; i++) paving += `M${260 + i * 14} 301L${260 + i * 52} 325`;
  const stepShade = [0, 1, 2];
</script>

<defs>
  <linearGradient id="qa-col" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--card)" /><stop offset=".45" style="stop-color:var(--cream)" /><stop offset="1" style="stop-color:var(--shade)" /></linearGradient>
  <linearGradient id="qa-wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:var(--void)" /><stop offset=".6" style="stop-color:var(--void)" /><stop offset="1" style="stop-color:var(--hill2)" stop-opacity=".5" /></linearGradient>
  <linearGradient id="qa-lit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--accent)" stop-opacity="0" /><stop offset="1" style="stop-color:var(--accent)" stop-opacity=".42" /></linearGradient>
  <linearGradient id="qa-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--card)" stop-opacity="0" /><stop offset=".5" style="stop-color:var(--card)" stop-opacity=".22" /><stop offset="1" style="stop-color:var(--card)" stop-opacity="0" /></linearGradient>
  <linearGradient id="qa-eave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--ink)" stop-opacity=".38" /><stop offset="1" style="stop-color:var(--ink)" stop-opacity="0" /></linearGradient>
  <linearGradient id="qa-drum" x1="0" y1="0" x2="1" y2="0"><stop offset="0" style="stop-color:var(--card)" /><stop offset=".35" style="stop-color:var(--cream)" /><stop offset=".8" style="stop-color:var(--shade)" /><stop offset="1" style="stop-color:var(--shade)" /></linearGradient>
  <linearGradient id="qa-step" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--card)" /><stop offset="1" style="stop-color:var(--shade)" /></linearGradient>
  <linearGradient id="qa-pool" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--water)" /><stop offset="1" style="stop-color:var(--hill)" stop-opacity=".7" /></linearGradient>
  <linearGradient id="qa-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5" /><stop offset="1" stop-color="#fff" stop-opacity="0" /></linearGradient>
  <mask id="qa-fademask" maskUnits="userSpaceOnUse" x="0" y="300" width="520" height="30"><rect x="0" y="300" width="520" height="30" fill="url(#qa-fade)" /></mask>
  <radialGradient id="qa-lamp" cx="50%" cy="50%" r="50%"><stop offset="0" style="stop-color:var(--accent)" stop-opacity=".7" /><stop offset="1" style="stop-color:var(--accent)" stop-opacity="0" /></radialGradient>
</defs>

{#snippet bld()}
    <!-- khối trụ tròn -->
    <rect x="186" y="80" width="148" height="48" fill="url(#qa-drum)" />
    <path class="k" d={fins.map((x) => `M${x} 84v44`).join('')} stroke-width=".7" opacity=".6" />
    <rect class="k" x="186" y="80" width="148" height="48" stroke-width="1.9" />
    <ellipse class="f-acc k" cx="260" cy="80" rx="76" ry="10" stroke-width="1.9" />
    <ellipse class="ks" cx="260" cy="79" rx="60" ry="6.5" stroke-width="1.1" />
    <path d="M200 76q60-9 120 0" fill="none" style="stroke:var(--card)" stroke-width="1.2" opacity=".55" />
    <rect class="f-cream k" x="178" y="124" width="164" height="6" stroke-width="1.3" />
    <!-- mái + diềm -->
    <rect class="f-cream k" x="84" y="128" width="352" height="10" stroke-width="2.1" />
    <rect fill="url(#qa-step)" x="86" y="129" width="348" height="3" opacity=".7" />
    <rect class="f-seal k" x="100" y="138" width="320" height="12" stroke-width="1.5" />
    <path class="ka" d={meander} stroke-width="1" />
    <rect x="100" y="150" width="320" height="16" fill="url(#qa-eave)" />
    <!-- tường kính -->
    <rect x="112" y="150" width="296" height="120" fill="url(#qa-wall)" />
    <rect x="112" y="150" width="296" height="120" fill="url(#qa-lit)" />
    <path class="kp" d="M112 172h296M112 194h296M112 216h296M112 238h296" stroke-width=".7" opacity=".5" />
    <path class="kp" d={mull.map((x) => `M${x} 150v120`).join('')} stroke-width=".5" opacity=".28" />
    <path d="M150 150l52 0l-70 120h-52z M262 150l30 0l-70 120h-30z M340 150l18 0l-70 120h-18z" fill="url(#qa-shine)" />
    <!-- hàng cột -->
    {#each cols as x (x)}
      <rect x={x - 4.5} y="155" width="9" height="110" fill="url(#qa-col)" />
      <rect class="k" x={x - 4.5} y="155" width="9" height="110" stroke-width="1.1" />
      <path class="kw" d="M{x - 1.5} 160v100M{x + 1.5} 160v100" stroke-width=".5" />
      <rect class="f-cream k" x={x - 6.5} y="150" width="13" height="5" stroke-width="1.3" />
      <rect class="f-cream k" x={x - 6.5} y="265" width="13" height="5" stroke-width="1.3" />
      <path d="M{x + 4.5} 160l7 105h-7z" fill="var(--ink)" opacity=".1" />
    {/each}
    <!-- bệ, bậc -->
    <rect class="k" x="96" y="270" width="328" height="12" style="fill:url(#qa-step)" stroke-width="2" />
    {#each stepShade as i (i)}
      <rect class="k" x={132 + i * 18} y={282 + i * 9.5} width={256 - i * 36} height="9.5" style="fill:url(#qa-step)" stroke-width={1.6 - i * 0.2} />
      <path class="kw" d="M{134 + i * 18} {284 + i * 9.5}h{252 - i * 36}" stroke-width=".6" />
    {/each}
    <path d="M150 301h220v-10h-220z" fill="var(--ink)" opacity=".08" />
    <path class="f-cream k" d="M234 286q13-7 26 0q13-7 26 0v9q-13-6-26 0q-13-6-26 0z" stroke-width="1.3" />
    <path class="k" d="M260 286v9M240 289h14M266 289h14" stroke-width=".7" />
{/snippet}

<!-- lớp xa: quầng sáng, phố xa mờ -->
<Clouds cy={140} r={116} puffs={false} ground={false} />
<g class="f-hill2" opacity=".35">
  {#each skyline as [x, h] (x)}<rect x={x} y={301 - h} width="14" height={h} />{/each}
</g>
<g class="cloud-drift"><path d="M60 120q14-14 30-6q10-12 28-2q16 2 14 14h-72z" class="f-card" opacity=".7" /><path d="M392 100q12-12 26-4q10-10 24 0q14 2 12 12h-62z" class="f-card" opacity=".7" /></g>

<!-- lớp giữa: toà nhà -->
{@render bld()}
<!-- bóng đổ xuống thềm -->
<path d="M96 282h328v6l-12 4H108z" fill="var(--ink)" opacity=".1" />

<!-- đèn đường hai bên -->
{#each [100, 420] as x (x)}
  <circle class="lamp" cx={x} cy="262" r="16" fill="url(#qa-lamp)" />
  <path class="k" d="M{x} 301v-42" stroke-width="1.8" /><circle class="f-cream k" cx={x} cy="257" r="4" stroke-width="1.2" />
{/each}

<!-- hồ phản chiếu -->
<rect x="24" y="301" width="472" height="24" fill="url(#qa-pool)" />
<g transform="translate(0 602) scale(1 -1)" mask="url(#qa-fademask)" opacity=".7">{@render bld()}</g>
<path class="k" d="M24 301h472" stroke-width="1.6" />
<g class="ripple" style="stroke:var(--card)" fill="none" stroke-width=".9" opacity=".7"><path d="M60 310h40M150 316h60M290 311h50M380 318h70M220 322h40M430 309h30" /></g>
<path d="M24 325h472" class="kw" stroke-width="1.2" />

<!-- lớp gần: cây tán lớn đổ bóng -->
{#each [{ x: 50, s: 1.35 }, { x: 472, s: 1.25 }] as t (t.x)}
  <g transform="translate({t.x} 303) scale({t.s})">
    <ellipse cx="0" cy="2" rx="26" ry="3.5" fill="var(--ink)" opacity=".14" />
    <path class="f-acc2 k" d="M-4 0h8l-1-30h-6z" stroke-width="1.6" />
    <circle class="f-leaf2 k" cx="-14" cy="-40" r="14" stroke-width="1.7" /><circle class="f-leaf2 k" cx="14" cy="-42" r="15" stroke-width="1.7" /><circle class="f-leaf k" cx="0" cy="-58" r="17" stroke-width="1.7" />
    <path d="M-12-52a10 10 0 0 1 12-8M6-50a9 9 0 0 1 10-6M-24-40a8 8 0 0 1 6-6" fill="none" style="stroke:var(--card)" stroke-width="1.5" opacity=".55" />
    <path class="k" d="M-6-34q4 4 9 2M8-44q3 3 7 1M-2-60q3 3 7 1" stroke-width=".7" />
    <path d="M-5-30c10 0 14-8 18-18c2 10-4 22-18 22z" fill="var(--ink)" opacity=".12" />
  </g>
{/each}


<style>
  .cloud-drift { animation: qa-drift 38s ease-in-out 2 alternate; }
  .lamp { animation: qa-lamp 4.2s ease-in-out 2; transform-box: fill-box; transform-origin: center; }
  .ripple { animation: qa-rip 7s ease-in-out 2 alternate; }
  @keyframes qa-drift { to { transform: translateX(22px); } }
  @keyframes qa-lamp { 50% { opacity: .55; } }
  @keyframes qa-rip { to { transform: translateX(6px); } }
  @media (prefers-reduced-motion: reduce) { .cloud-drift, .lamp, .ripple { animation: none; } }
  :global(.reduced-motion) .cloud-drift, :global(.reduced-motion) .lamp, :global(.reduced-motion) .ripple { animation: none; }
</style>
