<script lang="ts">
  // Chân dung chibi nét dày (thẻ trắng bo góc trên nền màu nhánh): đầu to, nét đen đều, màu phẳng — nhân vật chung, không mô phỏng người thật.
  // Trang phục xét xử/kiểm sát vẽ giản lược, không cấp hiệu/phù hiệu thật. Phía sau: trụ sở theo nhánh vẽ cùng nét, tô nhạt.
  import type { Avatar } from '$lib/game/wardrobe';
  import type { ArtName } from './registry';
  import { ring } from './kit';
  let { avatar, scene = 'tam-quan', accent = '#3f9e63' }: { avatar: Avatar; scene?: ArtName; accent?: string } = $props();
  const kind = $derived(scene === 'quoc-hoi' ? 'quoc-hoi' : scene === 'toa-an' ? 'toa-an' : scene === 'ngo-mon' ? 'tru-so' : 'dinh');
  const o = $derived(avatar.outfit);
  const INK = '#1d1d1f', SKIN = '#fde6da', BLUSH = '#f7b9b9';
  const stars = [[46, 70, 9], [252, 92, 7], [232, 40, 5], [60, 150, 5], [262, 170, 8]];
  const star = (x: number, y: number, r: number) => `M${x} ${y - r}Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y}Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y}Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}z`;
</script>

<svg class="portrait-chibi" viewBox="0 0 300 360" aria-hidden="true" focusable="false" stroke-linecap="round" stroke-linejoin="round">
  <defs><clipPath id="pc-clip"><rect x="16" y="16" width="268" height="328" rx="20" /></clipPath></defs>
  <rect width="300" height="360" rx="26" fill={accent} />
  <rect x="16" y="16" width="268" height="328" rx="20" fill="#fff" />
  <g clip-path="url(#pc-clip)">
    <!-- nền -->
    {#if avatar.effect !== 'khong'}<circle cx="150" cy="150" r="104" fill={accent} opacity=".12" />{/if}
    {#if avatar.effect === 'trong-dong' || avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
      <g class="sun-spin" opacity=".55"><path d={ring(150, 150, 96, 108, 44)} fill={accent} opacity=".5" /><circle cx="150" cy="150" r="90" fill="none" stroke={accent} stroke-width="2" stroke-dasharray="2 6" /></g>
    {/if}
    <g fill={accent} fill-opacity=".14" stroke={INK} stroke-opacity=".35" stroke-width="2.4">
      {#if kind === 'quoc-hoi'}
        <rect x="54" y="214" width="192" height="90" /><rect x="110" y="186" width="80" height="28" /><ellipse cx="150" cy="186" rx="40" ry="7" />
        <path d="M66 224v70M84 224v70M102 224v70M198 224v70M216 224v70M234 224v70" fill="none" />
      {:else if kind === 'toa-an'}
        <path d="M60 230l90-50l90 50z" /><rect x="66" y="230" width="168" height="80" />
        <path d="M84 238v66M108 238v66M192 238v66M216 238v66M150 192v24M140 204h20" fill="none" />
      {:else if kind === 'tru-so'}
        <rect x="40" y="226" width="220" height="80" /><path d="M30 226q20-20 40-14h160q20-6 40 14z" /><rect x="120" y="190" width="60" height="36" /><path d="M110 192q20-18 40-12q20-6 40 12z" />
      {:else}
        <path d="M44 236q16-22 40-18h132q24-4 40 18z" /><rect x="60" y="236" width="180" height="70" /><path d="M128 306v-34a22 22 0 0 1 44 0v34" fill="none" />
      {/if}
    </g>
    {#if avatar.effect === 'hat-sang' || avatar.effect === 'nang'}
      <g class="sparks" fill={accent} stroke={INK} stroke-width="1.6">{#each stars.slice(0, avatar.effect === 'nang' ? 2 : 5) as [x, y, r], i (i)}<path d={star(x, y, r)} style="animation-delay:{i * 0.35}s" />{/each}</g>
    {/if}
    <!-- thân + trang phục -->
    <g stroke={INK} stroke-width="3.4">
      {#if o === 'ao-choang'}
        <path d="M38 360q4-96 74-110h76q70 14 74 110z" fill="#202024" />
        <path d="M112 250l38 34l38-34" fill="none" stroke="#c0392b" stroke-width="9" />
        <path d="M128 252l22 22l22-22z" fill="#fff" />
      {:else if o === 'dong-phuc-ks'}
        <path d="M38 360q4-96 74-110h76q70 14 74 110z" fill="#2c5aa0" />
        <path d="M120 250h60v14q-30 12-60 0z" fill="#1e3f75" />
        <path d="M150 266v94" fill="none" /><g fill="#e8c45a" stroke-width="2"><circle cx="150" cy="290" r="5" /><circle cx="150" cy="318" r="5" /><circle cx="150" cy="346" r="5" /></g>
      {:else if o === 'ao-dai'}
        <path d="M38 360q4-96 74-110h76q70 14 74 110z" fill="#c0392b" />
        <path d="M126 244h48v22q-24 8-48 0z" fill="#e8c45a" />
        <path d="M70 312q20-10 40 0t40 0t40 0t40 0M80 340q18-8 35 0t35 0t35 0t35 0" fill="none" stroke="#e8c45a" stroke-width="3" />
      {:else if o === 'vest'}
        <path d="M118 250h64l-8 110h-48z" fill="#fff" />
        <path d="M38 360q4-96 74-110l26 62l12-22l12 22l26-62q70 14 74 110z" fill="#24324f" />
        <path d="M144 262h12l4 10l-6 44l-4 6l-4-6l-6-44z" fill="#c0392b" stroke-width="2.4" />
      {:else}
        <path d="M38 360q4-96 74-110h76q70 14 74 110z" fill="#fff" />
        <path d="M112 250l38 28l-18 20zM188 250l-38 28l18 20z" fill="#fff" />
        <rect x="190" y="292" width="26" height="22" rx="3" fill={accent} stroke-width="2.6" />
      {/if}
    </g>
    <!-- cổ, tóc sau, đầu -->
    {#if avatar.hair === 'dai'}<path d="M84 140q-10 80 12 114h108q22-34 12-114z" fill={INK} />{/if}
    <path d="M134 214v34q16 10 32 0v-34z" fill={SKIN} stroke={INK} stroke-width="3.2" />
    <circle cx="90" cy="160" r="15" fill={SKIN} stroke={INK} stroke-width="3.2" /><circle cx="210" cy="160" r="15" fill={SKIN} stroke={INK} stroke-width="3.2" />
    <path d="M86 156q6-4 9 4M214 156q-6-4-9 4" fill="none" stroke={INK} stroke-width="2.2" />
    <ellipse cx="150" cy="156" rx="62" ry="64" fill={SKIN} stroke={INK} stroke-width="3.4" />
    <!-- tóc trước -->
    {#if avatar.hair === 'dai'}
      <path d="M86 150q-4-72 64-76q70 4 64 76q-6-26-16-34q-4 18-18 24q4-16 0-26q-14 22-46 28q8-12 8-26q-20 16-40 22q-2 4-16 12z" fill={INK} stroke={INK} stroke-width="3" />
    {:else}
      <path d="M90 138q-4-60 60-66q8-10 22-12q-6 8-4 12q40 10 42 66q-10-18-24-24q2 10-4 18q-6-14-20-18q2 10-6 16q-6-14-22-16q4 10-2 16q-10-10-24-10q-8 4-18 18z" fill={INK} stroke={INK} stroke-width="3" />
    {/if}
    <!-- mặt -->
    <g fill={INK}><ellipse cx="126" cy="164" rx="7.5" ry="10" /><ellipse cx="174" cy="164" rx="7.5" ry="10" /></g>
    <g fill="#fff"><circle cx="128.5" cy="160" r="2.6" /><circle cx="176.5" cy="160" r="2.6" /></g>
    <path d="M116 146q8-5 16-2M168 144q8-3 16 2" fill="none" stroke={INK} stroke-width="2.6" />
    <g fill={BLUSH} opacity=".85"><ellipse cx="110" cy="184" rx="10" ry="6" /><ellipse cx="190" cy="184" rx="10" ry="6" /></g>
    <path d="M144 194q6 5 12 0" fill="none" stroke={INK} stroke-width="2.6" />
    <!-- phụ kiện -->
    {#if avatar.accessory === 'kinh'}
      <g fill="none" stroke={INK} stroke-width="3"><circle cx="126" cy="164" r="17" /><circle cx="174" cy="164" r="17" /><path d="M143 162h14M109 160l-18-4M191 160l18-4" /></g>
    {:else if avatar.accessory === 'but'}
      <g stroke={INK} stroke-width="2.6"><path d="M200 300l10-34l7 2l-9 34z" fill="#e8c45a" /><rect x="190" y="296" width="30" height="8" rx="2" fill="#fff" /></g>
    {:else if avatar.accessory === 'so'}
      <g transform="rotate(-12 230 320)" stroke={INK} stroke-width="3"><rect x="206" y="290" width="48" height="62" rx="5" fill={accent} /><path d="M216 306h28M216 318h20" stroke="#fff" /></g>
    {:else if avatar.accessory === 'cap'}
      <g stroke={INK} stroke-width="3"><rect x="30" y="292" width="76" height="54" rx="7" fill="#9a6b3f" /><path d="M54 292v-10h28v10M30 314h76" fill="none" /><rect x="62" y="308" width="12" height="12" rx="2" fill="#e8c45a" /></g>
    {:else if avatar.accessory === 'huy-hieu'}
      <g stroke={INK} stroke-width="2.4"><circle cx="196" cy="282" r="11" fill="#e8c45a" /><circle cx="196" cy="282" r="4.5" fill={accent} /></g>
      <g stroke={INK} stroke-width="2" fill={accent}><rect x="86" y="174" width="7" height="13" rx="3.5" /><rect x="207" y="174" width="7" height="13" rx="3.5" /></g>
    {/if}
    {#if avatar.effect === 'hat-sang' || avatar.effect === 'trong-dong'}<path d={star(198, 100, 9)} fill={accent} stroke={INK} stroke-width="1.8" />{/if}
  </g>
  {#if avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
    <rect x="22" y="22" width="256" height="316" rx="16" fill="none" stroke="#d9a93a" stroke-width="4" /><rect x="30" y="30" width="240" height="300" rx="12" fill="none" stroke="#d9a93a" stroke-width="1.6" />
  {/if}
  <rect x="16" y="16" width="268" height="328" rx="20" fill="none" stroke={INK} stroke-width="3.4" />
</svg>
