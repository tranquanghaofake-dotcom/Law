<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Đồ vật trưng hai bên bục (21 món, khoá = PropId trong lib/game/looks.ts): con dấu cách điệu, khay hồ sơ, hòm phiếu, bộ luật, cán cân,
  // hồ sơ vụ án, cặp hồ sơ, kính lúp, sổ tay + bút, chậu cây, micro, đồng hồ để bàn, quả địa cầu, bình sen, đèn bàn, chồng sách,
  // bút lông + nghiên, cuộn sắc lệnh, trống đồng nhỏ, máy tính xách tay, bảng biểu đồ. Chất liệu kim loại/gỗ lên theo bậc: gỗ → đồng → vàng → vàng sáng.
  // Tự vẽ SVG; con dấu không có hình, chữ hay Quốc huy; không vẽ búa gỗ, cờ, sao vàng.
  import type { Material } from '$lib/game/looks';
  let { item, mat = 'go', side }: { item: string; mat?: Material; side: 'left' | 'right' } = $props();
  const INK = '#2b2420';
  const MAT = {
    go: { base: '#9a6b42', hi: '#c99b6b', dark: '#5a3a22' },
    dong: { base: '#a8743a', hi: '#e2b475', dark: '#5e3b16' },
    vang: { base: '#c99a3a', hi: '#f6dc94', dark: '#7a5520' },
    'vang-sang': { base: '#d6ab48', hi: '#fff1bd', dark: '#7a5520' },
  } as const;
  const m = $derived(MAT[mat]);
  const uid = `sp${++seq}`;
</script>

<svg class="sc-prop {side}" class:shine={mat === 'vang' || mat === 'vang-sang'} data-item={item} viewBox="0 0 80 90" aria-hidden="true" focusable="false" stroke-linecap="round" stroke-linejoin="round">
  <defs><linearGradient id="{uid}-m" x1="0" x2="1"><stop offset="0" stop-color={m.dark} /><stop offset=".45" stop-color={m.hi} /><stop offset="1" stop-color={m.base} /></linearGradient></defs>
  <ellipse cx="40" cy="86" rx="30" ry="3.5" fill="#000" opacity=".22" />
  <g stroke={INK} stroke-width="1.2">
    {#if item === 'con-dau'}
      <!-- con dấu cách điệu trên đế -->
      <rect x="14" y="72" width="52" height="13" rx="2" fill="url(#{uid}-m)" />
      <rect x="22" y="58" width="36" height="14" rx="2" fill="#2b2b30" /><path d="M24 62h32" stroke="#55555c" />
      <path d="M34 58l-2-18h16l-2 18Z" fill="url(#{uid}-m)" /><ellipse cx="40" cy="34" rx="10" ry="8" fill="url(#{uid}-m)" />
      <ellipse cx="40" cy="31" rx="5" ry="2.4" fill={m.hi} stroke="none" opacity=".7" />
    {:else if item === 'khay-ho-so'}
      <!-- khay hồ sơ ba tầng -->
      <path d="M8 84h64l-4-10H12Z" fill="url(#{uid}-m)" />
      <path d="M14 74l2-14h48l2 14" fill="#f3ead6" /><path d="M18 60l2-12h40l2 12" fill="#e6d9bc" /><path d="M22 48l2-10h32l2 10" fill="#f3ead6" />
      <path d="M20 66h40M24 54h32M28 43h24" stroke="#a89878" stroke-width=".9" /><rect x="44" y="34" width="12" height="9" fill="#3a5a8a" stroke-width="1" />
    {:else if item === 'hom-phieu'}
      <!-- hòm phiếu -->
      <rect x="12" y="44" width="56" height="40" rx="2" fill="url(#{uid}-m)" /><path d="M10 44h60l-4-8H14Z" fill={m.hi} />
      <rect x="30" y="38" width="20" height="3" fill="#1e1e22" stroke="none" /><path d="M34 39l-1-18h14l-1 18" fill="#f3ead6" /><path d="M37 28l3 3l5-6" stroke="#a8322b" stroke-width="1.4" fill="none" />
      <rect x="24" y="56" width="32" height="14" rx="1.5" fill="#f3ead6" /><path d="M28 63h24" stroke="#a89878" />
    {:else if item === 'bo-luat'}
      <!-- bộ luật đóng bìa: hai cuốn đứng, một cuốn nghiêng -->
      <rect x="10" y="26" width="16" height="58" rx="1.5" fill="#7a2020" /><rect x="27" y="22" width="17" height="62" rx="1.5" fill="#1f3a6a" />
      <path d="M48 84l14-56l13 3l-14 56Z" fill="#7a2020" />
      <path d="M10 36h16M10 72h16M27 32h17M27 74h17M51 74l13 3M58 46l12 3" stroke={m.hi} stroke-width="2" />
      <rect x="13" y="44" width="10" height="16" fill="url(#{uid}-m)" stroke-width=".8" /><rect x="30" y="42" width="11" height="18" fill="url(#{uid}-m)" stroke-width=".8" />
    {:else if item === 'can-can'}
      <!-- cán cân trên đế -->
      <path d="M22 84h36l-4-8H26Z" fill="url(#{uid}-m)" />
      <path d="M40 76V20M14 26q26-6 52 0M14 26l-7 20M14 26l7 20M66 26l-7 20M66 26l7 20" fill="none" stroke="url(#{uid}-m)" stroke-width="2.6" />
      <path d="M40 76V20M14 26q26-6 52 0" fill="none" stroke={INK} stroke-width=".6" opacity=".5" />
      <path d="M4 46q10 8 20 0ZM56 46q10 8 20 0Z" fill="url(#{uid}-m)" /><circle cx="40" cy="17" r="3.4" fill={m.hi} />
    {:else if item === 'ho-so-vu-an'}
      <!-- hồ sơ vụ án buộc dây -->
      <rect x="10" y="56" width="60" height="28" rx="2" fill="#c9b48a" /><rect x="14" y="44" width="54" height="14" rx="2" fill="#d8c59c" /><rect x="12" y="34" width="52" height="12" rx="2" fill="#c9b48a" />
      <path d="M40 34v50M10 70h60" stroke="#a8322b" stroke-width="2.4" /><path d="M40 70l-6-5v10ZM40 70l6-5v10Z" fill="#a8322b" stroke-width="1" />
      <rect x="16" y="60" width="16" height="7" fill="#f3ead6" stroke-width=".9" />
    {:else if item === 'cap-ho-so'}
      <!-- cặp hồ sơ -->
      <path d="M30 40v-6q0-4 4-4h12q4 0 4 4v6" fill="none" stroke="url(#{uid}-m)" stroke-width="3.4" />
      <rect x="8" y="40" width="64" height="44" rx="4" fill="#3b2a20" /><path d="M8 56h64" stroke="#241912" />
      <rect x="34" y="52" width="12" height="9" rx="1.5" fill="url(#{uid}-m)" /><path d="M12 44h56" stroke={m.hi} stroke-width=".8" opacity=".5" />
    {:else if item === 'kinh-lup'}
      <!-- kính lúp trên tập tài liệu -->
      <path d="M6 84l8-22h56l4 22Z" fill="#f3ead6" /><path d="M14 70h48M12 76h52" stroke="#a89878" stroke-width=".9" />
      <path d="M50 52l18 26" stroke="url(#{uid}-m)" stroke-width="6" /><path d="M50 52l18 26" stroke={INK} stroke-width=".6" opacity=".5" />
      <circle cx="38" cy="36" r="17" fill="#cfe3f2" fill-opacity=".35" stroke="url(#{uid}-m)" stroke-width="4.4" />
      <circle cx="38" cy="36" r="17" fill="none" stroke={INK} stroke-width=".8" /><path d="M29 29q5-6 12-5" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8" />
    {:else if item === 'so-tay'}
      <!-- sổ tay bìa da + bút cắm -->
      <rect x="12" y="38" width="40" height="46" rx="2.5" fill="#7a2020" /><path d="M17 38v46" stroke={m.hi} stroke-width="1.6" />
      <rect x="25" y="50" width="22" height="14" rx="1" fill="#f3ead6" /><path d="M28 55h16M28 59h12" stroke="#a89878" stroke-width=".9" />
      <path d="M58 84L64 34l5 1l-3 49Z" fill="url(#{uid}-m)" /><path d="M64 34l2.5-8l2.5 9Z" fill="#2b2b30" />
    {:else if item === 'chau-cay'}
      <!-- chậu cây xanh -->
      <path d="M24 84l3-24h26l3 24Z" fill="#b5653a" /><path d="M23 60h34" stroke={INK} stroke-width="1.6" /><path d="M26 66h28" stroke="#e2a074" stroke-width=".8" />
      <path d="M40 60Q18 52 16 30Q34 32 40 60Z" fill="#4f8a4f" /><path d="M40 60Q62 52 64 30Q46 32 40 60Z" fill="#5fa05c" /><path d="M40 60Q30 36 40 12Q50 36 40 60Z" fill="#3f7a46" />
      <path d="M40 58V20M38 52Q26 42 22 34M42 52Q54 42 58 34" fill="none" stroke="#2d5a34" stroke-width=".8" />
    {:else if item === 'micro'}
      <!-- micro để bàn nghị trường -->
      <ellipse cx="40" cy="80" rx="20" ry="5" fill="#2b2b30" /><path d="M40 78V46" stroke="url(#{uid}-m)" stroke-width="3.4" />
      <rect x="31" y="14" width="18" height="34" rx="9" fill="#2b2b30" /><path d="M33 22h14M32 28h16M33 34h14" stroke="#6a6a72" stroke-width=".9" />
      <path d="M31 40h18" stroke="url(#{uid}-m)" stroke-width="3" /><path d="M22 82l-4-2M58 82l4-2" stroke="url(#{uid}-m)" stroke-width="1.6" />
    {:else if item === 'dong-ho'}
      <!-- đồng hồ để bàn -->
      <path d="M14 84V50a26 26 0 0 1 52 0v34Z" fill="url(#{uid}-m)" /><circle cx="40" cy="50" r="18" fill="#f6efdc" />
      <path d="M40 38v12l8 5" fill="none" stroke={INK} stroke-width="1.6" />
      <path d="M40 33v3M40 64v3M25 50h3M52 50h3M29.5 39.5l2 2M50.5 39.5l-2 2M29.5 60.5l2-2M50.5 60.5l-2-2" stroke={INK} stroke-width=".9" /><circle cx="40" cy="50" r="1.6" fill={INK} />
    {:else if item === 'qua-cau'}
      <!-- quả địa cầu trên giá -->
      <path d="M26 84h28l-3-6H29Z" fill="url(#{uid}-m)" /><path d="M40 78V68" stroke="url(#{uid}-m)" stroke-width="3" />
      <circle cx="40" cy="42" r="25" fill="#7fb0cf" /><path d="M28 28q8-6 14 2q4 8-6 10q-8 2-8 10q-6-8 0-22ZM50 44q8-2 10 6q-2 8-8 8q-4-6-2-14Z" fill="#6fa86a" stroke-width=".8" />
      <ellipse cx="40" cy="42" rx="11" ry="25" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width=".8" />
      <path d="M12 26q-7 28 28 52" fill="none" stroke="url(#{uid}-m)" stroke-width="2.6" /><path d="M24 24q8-8 16-6" fill="none" stroke="#fff" stroke-width="1.6" opacity=".6" />
    {:else if item === 'binh-sen'}
      <!-- bình men ngọc cắm hoa sen -->
      <path d="M30 84q-9-22 4-36h12q13 14 4 36Z" fill="#8fb8aa" /><path d="M31 74h18M33 60h14" stroke="#e8f2ee" stroke-width=".9" />
      <path d="M40 50V26" stroke="#4f8a4f" stroke-width="2" /><path d="M40 28Q24 24 24 10Q36 10 40 28ZM40 28Q56 24 56 10Q44 10 40 28ZM40 28Q32 14 40 2Q48 14 40 28Z" fill="#f0a9b4" stroke="#8c3b44" stroke-width=".9" />
      <ellipse cx="40" cy="26" rx="5" ry="2.4" fill="#f1d896" stroke-width=".8" />
    {:else if item === 'den-ban'}
      <!-- đèn bàn -->
      <ellipse cx="34" cy="82" rx="18" ry="4" fill="url(#{uid}-m)" /><path d="M34 80V54L52 30" fill="none" stroke="url(#{uid}-m)" stroke-width="3.4" />
      <path d="M44 22l26 10l-12 14Z" fill="url(#{uid}-m)" /><path d="M48 28l16 6" stroke={m.hi} stroke-width="1.2" fill="none" />
      <path d="M52 48q6 8 8 20" stroke="#fff3cf" stroke-width="10" opacity=".25" fill="none" stroke-linecap="butt" />
    {:else if item === 'chong-sach'}
      <!-- chồng sách ba cuốn -->
      <rect x="8" y="68" width="64" height="16" rx="1.5" fill="#7a2020" /><rect x="14" y="52" width="54" height="16" rx="1.5" fill="#1f3a6a" /><rect x="20" y="38" width="46" height="14" rx="1.5" fill="#2f6a4a" />
      <path d="M12 72h56M12 80h56M18 56h48M18 64h48M24 42h38M24 48h38" stroke="#f3ead6" stroke-width="1.2" opacity=".75" /><path d="M8 76h4M14 60h4M20 45h4" stroke={m.hi} stroke-width="2.4" />
    {:else if item === 'but-nghien'}
      <!-- nghiên mực + bút lông -->
      <path d="M8 84h60l-5-18H13Z" fill="#2a2a2e" /><ellipse cx="38" cy="68" rx="16" ry="4" fill="#0e0e10" /><path d="M14 66h48" stroke="#55555c" stroke-width=".9" />
      <path d="M54 70L68 12" stroke="url(#{uid}-m)" stroke-width="3.4" /><path d="M54 70q-3 6-6 8q7-1 8-6Z" fill="#1a1a1c" /><path d="M68 12l1-5" stroke="url(#{uid}-m)" stroke-width="2" />
    {:else if item === 'cuon-chieu'}
      <!-- cuộn giấy sắc lệnh + dấu son -->
      <rect x="14" y="32" width="52" height="44" fill="#f3ead6" /><rect x="10" y="28" width="60" height="8" rx="4" fill="url(#{uid}-m)" /><rect x="10" y="72" width="60" height="8" rx="4" fill="url(#{uid}-m)" />
      <path d="M22 44h36M22 50h36M22 56h26" stroke="#a89878" stroke-width="1" /><rect x="46" y="58" width="12" height="12" rx="1.5" fill="#b3261e" stroke="none" /><path d="M49 62h6M49 66h6" stroke="#f9d7d2" stroke-width=".9" />
    {:else if item === 'trong-mini'}
      <!-- trống đồng nhỏ: mặt trống vành tia + thân loe -->
      <path d="M14 42h52q-2 6-4 14Q60 68 66 82H14q6-14 4-26Q16 48 14 42Z" fill="url(#{uid}-m)" /><ellipse cx="40" cy="42" rx="26" ry="8" fill={m.hi} />
      <ellipse cx="40" cy="42" rx="18" ry="5.2" fill="none" stroke={m.dark} stroke-width=".9" /><ellipse cx="40" cy="42" rx="9" ry="2.6" fill={m.dark} stroke="none" opacity=".55" />
      <path d="M40 34v-2M26 36l-2-2M54 36l2-2M18 40l-3-1M62 40l3-1" stroke={m.dark} stroke-width=".9" /><path d="M22 58h36M20 70h40" stroke={m.dark} stroke-width=".9" stroke-dasharray="2 2.4" />
    {:else if item === 'laptop'}
      <!-- máy tính xách tay -->
      <path d="M8 80h64l5 5H3Z" fill="#9a9aa2" /><rect x="14" y="36" width="52" height="42" rx="2.5" fill="#2a2a30" /><rect x="18" y="40" width="44" height="34" rx="1" fill="#a7c7e7" />
      <path d="M22 66l8-8l8 4l10-12l8 6" fill="none" stroke="#2f5d9a" stroke-width="1.6" /><path d="M22 70h36" stroke="#fff" stroke-width=".8" opacity=".6" />
    {:else if item === 'bieu-do'}
      <!-- bảng biểu đồ cột trên chân -->
      <rect x="8" y="18" width="64" height="48" rx="2" fill="#f6efdc" /><path d="M18 58V40M30 58V30M42 58V46M54 58V26M64 58V36" stroke="url(#{uid}-m)" stroke-width="6" stroke-linecap="butt" />
      <path d="M12 58h56" stroke={INK} stroke-width="1" /><path d="M24 66l-6 18M56 66l6 18" stroke="url(#{uid}-m)" stroke-width="2.4" />
    {/if}
  </g>
</svg>
