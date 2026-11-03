<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Đồ vật trưng hai bên ma-nơ-canh theo nhánh: hành pháp (con dấu cách điệu, khay hồ sơ), lập pháp (hòm phiếu, bộ luật),
  // xét xử (cán cân, hồ sơ vụ án), kiểm sát (cặp hồ sơ, kính lúp). Chất liệu lên theo bậc: gỗ → đồng → vàng → vàng sáng.
  // Đồ vật cách điệu: con dấu không có hình, chữ hay Quốc huy; không vẽ búa gỗ.
  import type { Branch, PostTier } from '$lib/game/career';
  let { branch, tier = null, side }: { branch: Branch; tier?: PostTier | null; side: 'left' | 'right' } = $props();
  const INK = '#2b2420';
  const MAT = {
    none: { base: '#9a6b42', hi: '#c99b6b', dark: '#5a3a22' },
    'co-so': { base: '#9a6b42', hi: '#c99b6b', dark: '#5a3a22' },
    tinh: { base: '#a8743a', hi: '#e2b475', dark: '#5e3b16' },
    'trung-uong': { base: '#c99a3a', hi: '#f6dc94', dark: '#7a5520' },
    'lanh-dao': { base: '#d6ab48', hi: '#fff1bd', dark: '#7a5520' },
  } as const;
  const m = $derived(MAT[tier ?? 'none']);
  const item = $derived(`${branch}:${side}`);
  const uid = `sp${++seq}`;
</script>

<svg class="sc-prop {side}" class:shine={tier === 'trung-uong' || tier === 'lanh-dao'} viewBox="0 0 80 90" aria-hidden="true" focusable="false" stroke-linecap="round" stroke-linejoin="round">
  <defs><linearGradient id="{uid}-m" x1="0" x2="1"><stop offset="0" stop-color={m.dark} /><stop offset=".45" stop-color={m.hi} /><stop offset="1" stop-color={m.base} /></linearGradient></defs>
  <ellipse cx="40" cy="86" rx="30" ry="3.5" fill="#000" opacity=".22" />
  <g stroke={INK} stroke-width="1.2">
    {#if item === 'hanh-phap:left'}
      <!-- con dấu cách điệu trên đế -->
      <rect x="14" y="72" width="52" height="13" rx="2" fill="url(#{uid}-m)" />
      <rect x="22" y="58" width="36" height="14" rx="2" fill="#2b2b30" /><path d="M24 62h32" stroke="#55555c" />
      <path d="M34 58l-2-18h16l-2 18Z" fill="url(#{uid}-m)" /><ellipse cx="40" cy="34" rx="10" ry="8" fill="url(#{uid}-m)" />
      <ellipse cx="40" cy="31" rx="5" ry="2.4" fill={m.hi} stroke="none" opacity=".7" />
    {:else if item === 'hanh-phap:right'}
      <!-- khay hồ sơ ba tầng -->
      <path d="M8 84h64l-4-10H12Z" fill="url(#{uid}-m)" />
      <path d="M14 74l2-14h48l2 14" fill="#f3ead6" /><path d="M18 60l2-12h40l2 12" fill="#e6d9bc" /><path d="M22 48l2-10h32l2 10" fill="#f3ead6" />
      <path d="M20 66h40M24 54h32M28 43h24" stroke="#a89878" stroke-width=".9" /><rect x="44" y="34" width="12" height="9" fill="#3a5a8a" stroke-width="1" />
    {:else if item === 'lap-phap:left'}
      <!-- hòm phiếu -->
      <rect x="12" y="44" width="56" height="40" rx="2" fill="url(#{uid}-m)" /><path d="M10 44h60l-4-8H14Z" fill={m.hi} />
      <rect x="30" y="38" width="20" height="3" fill="#1e1e22" stroke="none" /><path d="M34 39l-1-18h14l-1 18" fill="#f3ead6" /><path d="M37 28l3 3l5-6" stroke="#a8322b" stroke-width="1.4" fill="none" />
      <rect x="24" y="56" width="32" height="14" rx="1.5" fill="#f3ead6" /><path d="M28 63h24" stroke="#a89878" />
    {:else if item === 'lap-phap:right'}
      <!-- bộ luật đóng bìa: hai cuốn đứng, một cuốn nghiêng -->
      <rect x="10" y="26" width="16" height="58" rx="1.5" fill="#7a2020" /><rect x="27" y="22" width="17" height="62" rx="1.5" fill="#1f3a6a" />
      <path d="M48 84l14-56l13 3l-14 56Z" fill="#7a2020" />
      <path d="M10 36h16M10 72h16M27 32h17M27 74h17M51 74l13 3M58 46l12 3" stroke={m.hi} stroke-width="2" />
      <rect x="13" y="44" width="10" height="16" fill="url(#{uid}-m)" stroke-width=".8" /><rect x="30" y="42" width="11" height="18" fill="url(#{uid}-m)" stroke-width=".8" />
    {:else if item === 'xet-xu:left'}
      <!-- cán cân trên đế -->
      <path d="M22 84h36l-4-8H26Z" fill="url(#{uid}-m)" />
      <path d="M40 76V20M14 26q26-6 52 0M14 26l-7 20M14 26l7 20M66 26l-7 20M66 26l7 20" fill="none" stroke="url(#{uid}-m)" stroke-width="2.6" />
      <path d="M40 76V20M14 26q26-6 52 0" fill="none" stroke={INK} stroke-width=".6" opacity=".5" />
      <path d="M4 46q10 8 20 0ZM56 46q10 8 20 0Z" fill="url(#{uid}-m)" /><circle cx="40" cy="17" r="3.4" fill={m.hi} />
    {:else if item === 'xet-xu:right'}
      <!-- hồ sơ vụ án buộc dây -->
      <rect x="10" y="56" width="60" height="28" rx="2" fill="#c9b48a" /><rect x="14" y="44" width="54" height="14" rx="2" fill="#d8c59c" /><rect x="12" y="34" width="52" height="12" rx="2" fill="#c9b48a" />
      <path d="M40 34v50M10 70h60" stroke="#a8322b" stroke-width="2.4" /><path d="M40 70l-6-5v10ZM40 70l6-5v10Z" fill="#a8322b" stroke-width="1" />
      <rect x="16" y="60" width="16" height="7" fill="#f3ead6" stroke-width=".9" />
    {:else if item === 'kiem-sat:left'}
      <!-- cặp hồ sơ -->
      <path d="M30 40v-6q0-4 4-4h12q4 0 4 4v6" fill="none" stroke="url(#{uid}-m)" stroke-width="3.4" />
      <rect x="8" y="40" width="64" height="44" rx="4" fill="#3b2a20" /><path d="M8 56h64" stroke="#241912" />
      <rect x="34" y="52" width="12" height="9" rx="1.5" fill="url(#{uid}-m)" /><path d="M12 44h56" stroke={m.hi} stroke-width=".8" opacity=".5" />
    {:else}
      <!-- kính lúp trên tập tài liệu -->
      <path d="M6 84l8-22h56l4 22Z" fill="#f3ead6" /><path d="M14 70h48M12 76h52" stroke="#a89878" stroke-width=".9" />
      <path d="M50 52l18 26" stroke="url(#{uid}-m)" stroke-width="6" /><path d="M50 52l18 26" stroke={INK} stroke-width=".6" opacity=".5" />
      <circle cx="38" cy="36" r="17" fill="#cfe3f2" fill-opacity=".35" stroke="url(#{uid}-m)" stroke-width="4.4" />
      <circle cx="38" cy="36" r="17" fill="none" stroke={INK} stroke-width=".8" /><path d="M29 29q5-6 12-5" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8" />
    {/if}
  </g>
</svg>
