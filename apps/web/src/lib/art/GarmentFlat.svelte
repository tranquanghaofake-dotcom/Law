<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Bản vẽ kỹ thuật trang phục trên ma-nơ-canh bán thân. Mỗi bộ gồm 3 lớp: mảnh vải (panels) → vân vải (texture, phủ lên
  // chính các mảnh đó) → chi tiết may (details: đường diễu, túi, khuy, nếp gấp). Vẽ nửa trái rồi lật gương; chi tiết lệch
  // (nẹp khuy, cà vạt, thẻ tên, khăn cài túi, thêu) vẽ riêng. Cả bộ qua filter `cloth`: mép tối dần, ánh đèn.
  // Không quân hàm, cấp hiệu, Quốc huy, huân chương; cầu vai kiểm sát là dải đỏ trơn viền chỉ vàng.
  // `tone`: chỉ số biến thể màu (showcase/tones.ts); `adorn`: phụ kiện cài áo / khăn lụa (looks.ts). Mặc định = bản gốc.
  import { TONE_PALETTES, type Pal } from './showcase/tones';
  let { outfit, tone = 0, adorn = 'khong', pattern = 'tron', neck = 'mac-dinh' }: { outfit: string; tone?: number; adorn?: string; pattern?: string; neck?: string } = $props();
  const uid = `gf${++seq}`;
  const INK = '#2b2420';
  const SCARF: Record<string, string> = { 'thuong-phuc': '#b3282d', 'cong-so': '#2c5aa0', 'vest-xanh': '#c99a3a', 'vest-den': '#7a2433', 'ao-choang': '#8c2f28', 'ks-xuan-he': '#e8e2d2', 'ks-thu-dong': '#c99a3a' };
  const PAL: Record<string, Pal> = {
    'thuong-phuc': { body: '#ece2cf', sleeve: '#e2d6bf', shirt: '#ece2cf', tie: null },
    'cong-so': { body: '#fbfbf8', sleeve: '#f0f2f3', shirt: '#fbfbf8', tie: null },
    'vest-xanh': { body: '#2f4570', sleeve: '#283c62', shirt: '#cfe0f4', tie: '#7a2433' },
    'vest-den': { body: '#2a2b30', sleeve: '#222328', shirt: '#fbfbf8', tie: '#b3282d' },
    'ao-choang': { body: '#232327', sleeve: '#1c1c20', shirt: '#fbfbf8', tie: '#2a2b30' },
    'ks-xuan-he': { body: '#a9c8ea', sleeve: '#9bbde2', shirt: '#a9c8ea', tie: null },
    'ks-thu-dong': { body: '#27365a', sleeve: '#213050', shirt: '#fbfbf8', tie: '#27365a' },
    'ao-dai': { body: '#a8322b', sleeve: '#982c26', shirt: '#f6f1e6', tie: null },
    // áo dài nam gấm xanh lam (cài nút chéo, quần lụa trắng), khăn đóng đội đầu
    'ao-dai-nam': { body: '#26467f', sleeve: '#203c6e', shirt: '#fbfbf8', tie: null },
    // áo tứ thân nâu non, yếm đào (shirt), váy lĩnh (tie), nón quai thao
    'tu-than': { body: '#7a5a3a', sleeve: '#6a4c30', shirt: '#e9a0a2', tie: '#1c1a1c' },
    // áo bà ba chàm, khăn rằn quàng cổ
    'ba-ba': { body: '#2d3a4d', sleeve: '#27334a', shirt: '#2d3a4d', tie: null },
    // áo nhật bình: thân đỏ thắm, ô vuông gấm vàng ở cổ ngực và gấu (tie), quần lụa trắng
    'nhat-binh': { body: '#8f1f2b', sleeve: '#7f1a26', shirt: '#f6f1e6', tie: '#d9b45a' },
  };
  const o = $derived(PAL[outfit] ? outfit : 'thuong-phuc');
  const p = $derived<Pal>({ ...PAL[o], ...(TONE_PALETTES[o]?.[tone] ?? {}) });
  const dark = $derived(o === 'vest-den' || o === 'ao-choang' || o === 'ks-thu-dong' || o === 'vest-xanh' || o === 'ba-ba' || o === 'ao-dai-nam');
  /** áo dài các kiểu: dài tới gần gối, quần lụa lộ ở hai tà */
  const robe = $derived(o === 'ao-dai' || o === 'ao-dai-nam' || o === 'nhat-binh');
  const suit = $derived(o === 'vest-xanh' || o === 'vest-den' || o === 'ks-thu-dong');
  const stitch = $derived(dark ? '#8d8f99' : '#8a7c6c');
  const fold = $derived(dark ? 'rgba(0,0,0,.55)' : 'rgba(80,60,40,.32)');
  const shine = $derived(dark ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.75)');
  const TEX = $derived(o === 'thuong-phuc' ? 'knit' : o === 'cong-so' || o === 'ks-xuan-he' || o === 'ba-ba' ? 'oxford' : o === 'ao-dai' ? 'silk' : o === 'ao-dai-nam' || o === 'nhat-binh' ? 'brocade' : 'twill');
  const F = `url(#${uid}-cloth)`;
  // cột ma-nơ-canh chỉ lộ dưới gấu áo (không lộ qua khe giữa hai vạt vest)
  const HEM: Record<string, number> = { 'thuong-phuc': 314, 'cong-so': 308, 'vest-xanh': 326, 'vest-den': 326, 'ks-thu-dong': 326, 'ao-choang': 364, 'ks-xuan-he': 292, 'ao-dai': 380, 'ao-dai-nam': 380, 'tu-than': 392, 'ba-ba': 284, 'nhat-binh': 380 };
  const hem = $derived(HEM[o]);
  const pc = $derived(dark ? 'rgba(255,255,255,.2)' : 'rgba(0,0,0,.16)');
  const showPat = $derived(pattern !== 'tron' && !robe && o !== 'tu-than' && o !== 'ba-ba');
  const fb = (c: string, tex: boolean, pat = false) => (pat ? `url(#${uid}-pat)` : tex ? `url(#${uid}-${TEX})` : c);
  // dải đan thừng giữa áo len: hai sợi bện chéo nhau
  const cable = (ph: number) => {
    let d = '';
    for (let y = 88; y <= 290; y += 2) { const x = 150 + Math.sin((y - 88) / 12 + ph) * 7; d += `${y === 88 ? 'M' : 'L'}${x.toFixed(1)} ${y}`; }
    return d;
  };
</script>

{#snippet sleeveLong(len: number, tex: boolean, pat = false)}
  <path d="M86 73C70 81 61 110 56 168L50 {len}L77 {len + 4}L81 186Q86 156 92 142Z" fill={fb(p.sleeve, tex, pat)} />
{/snippet}

{#snippet panels(tex: boolean, pat = false)}
  {#if o === 'thuong-phuc'}
    {@render sleeveLong(272, tex, pat)}
    <path d="M50 272L77 276L75 298L47 294Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M150 70Q133 70 124 57L86 73Q90 110 92 142L95 296L150 296Z" fill={fb(p.body, tex, pat)} />
    <path d="M95 296L150 296V318H96Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M124 57Q130 78 150 80V71Q135 70 129 55Z" fill={fb(p.sleeve, tex, pat)} />
  {:else if o === 'cong-so'}
    {@render sleeveLong(254, tex, pat)}
    <path d="M50 254L77 258L75 284L47 280Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M150 74Q133 72 124 57L86 73Q90 110 92 142L96 298Q122 320 150 314Z" fill={fb(p.body, tex, pat)} />
    <path d="M124 57Q137 66 150 67V61Q139 60 128 53Z" fill={fb(p.body, tex, pat)} />
    <path d="M127 58L117 66L131 94L148 76Q137 70 127 58Z" fill={fb(p.body, tex, pat)} />
  {:else if o === 'ks-xuan-he'}
    <path d="M86 73C70 81 60 100 53 132L84 144L92 140Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M53 132L84 144L85 137L56 124Z" fill={fb(p.body, tex, pat)} />
    <path d="M150 74Q133 72 124 57L86 73Q90 110 92 142L95 296L150 296Z" fill={fb(p.body, tex, pat)} />
    <path d="M150 84L124 57Q116 64 117 73L136 106L150 92Z" fill={fb(p.body, tex, pat)} />
  {:else if suit}
    {@render sleeveLong(286, tex, pat)}
    <path d="M128 57L84 72Q89 110 92 146L94 330Q120 338 140 334Q149 324 149 300L148 190Z" fill={fb(p.body, tex, pat)} />
    <!-- ve áo (ve chữ K) + cổ trên -->
    <path d="M128 57L116 65L104 96L114 98L108 108L148 190L150 186Z" fill={fb(p.sleeve, tex, pat)} />
  {:else if o === 'ao-choang'}
    <path d="M84 72C60 86 42 142 30 236L40 254L96 252Q92 190 92 142Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M34 236L40 254L96 252L95 240Z" fill={fb(p.body, tex, pat)} />
    <path d="M128 57L84 72Q80 200 70 366L150 370V100Z" fill={fb(p.body, tex, pat)} />
    <path d="M128 57L84 72L87 104Q120 112 150 110V100L130 57Z" fill={fb(p.body, tex, pat)} />
  {:else if o === 'ao-dai'}
    <path d="M102 76C90 90 84 130 80 200L74 286L90 288L96 204Q102 160 106 142Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M150 62H139L102 76Q106 110 106 142Q104 160 110 176L116 196Q110 300 106 384L150 386Z" fill={fb(p.body, tex, pat)} />
    <rect x="137" y="44" width="13" height="19" rx="2" fill={fb(p.body, tex, pat)} />
  {:else if o === 'ao-dai-nam'}
    <path d="M100 76C86 90 80 130 76 200L68 290L92 292L97 204Q102 160 105 142Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M150 62H139L100 76Q104 110 105 142Q104 170 106 200Q110 300 108 384L150 386Z" fill={fb(p.body, tex, pat)} />
    <rect x="137" y="44" width="13" height="19" rx="2" fill={fb(p.body, tex, pat)} />
  {:else if o === 'nhat-binh'}
    <path d="M102 76C86 90 78 130 70 210L52 296L98 300L100 214Q104 160 106 142Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M150 62H139L102 76Q106 110 106 142Q104 170 108 200Q110 300 108 384L150 386Z" fill={fb(p.body, tex, pat)} />
    <path d="M108 350L150 352V386L108 384Z" fill={fb(p.tie ?? '#d9b45a', tex, pat)} />
    <path d="M52 296L98 300L98 284L55 280Z" fill={fb(p.tie ?? '#d9b45a', tex, pat)} />
    <path d="M150 60L100 72L96 128L150 140Z" fill={fb(p.tie ?? '#d9b45a', tex, pat)} />
    <rect x="137" y="44" width="13" height="19" rx="2" fill={fb(p.body, tex, pat)} />
  {:else if o === 'tu-than'}
    <path d="M98 296H150V392H90Z" fill={fb(p.tie ?? '#1c1a1c', tex, pat)} />
    <path d="M86 73C68 82 58 112 52 170L44 262L76 266L82 190Q88 156 92 142Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M128 57L86 73Q90 110 92 142L90 300Q112 328 150 322L150 200Q142 120 128 57Z" fill={fb(p.body, tex, pat)} />
  {:else if o === 'ba-ba'}
    <path d="M86 73C68 82 58 112 52 168L44 258L78 262L82 186Q86 156 92 142Z" fill={fb(p.sleeve, tex, pat)} />
    <path d="M150 74Q136 72 126 58L86 73Q90 110 92 142L95 246L90 276Q122 284 150 280Z" fill={fb(p.body, tex, pat)} />
  {/if}
{/snippet}

{#snippet details()}
  {#if o === 'thuong-phuc'}
    <!-- bo tay, bo gấu, cổ bo: gân dọc -->
    {#each [0, 1, 2, 3, 4, 5, 6] as k (k)}<path d="M{50 + k * 3.8} {273 + k * 0.6}l-2 20" stroke={stitch} stroke-width=".7" />{/each}
    {#each [100, 106, 112, 118, 124, 130, 136, 142, 148] as x (x)}<path d="M{x} 299V315" stroke={stitch} stroke-width=".7" />{/each}
    {#each [0, 1, 2, 3, 4, 5] as k (k)}<path d="M{127 + k * 4} {58 + k * 2.6}l{-1 + k * 0.2} 7" stroke={stitch} stroke-width=".7" />{/each}
    <path d="M88 76Q90 110 92 140" fill="none" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M58 180q9 5 21 3M56 196q10 6 23 2M52 250q10 4 22 4M100 250q14 8 30 4M98 200q10 4 20 2" fill="none" stroke={fold} stroke-width="1" />
    <path d="M134 84V294M138 86V294" stroke={stitch} stroke-width=".8" />
    <path d="M84 80Q70 96 64 140" fill="none" stroke={shine} stroke-width="2" />
  {:else if o === 'cong-so'}
    <path d="M121 66L132 90M128 62L145 76" stroke={stitch} stroke-width=".8" stroke-dasharray="2 1.6" />
    <path d="M104 120h25v24l-12.5 5l-12.5-5Z" fill="none" />
    <path d="M106 125h21" stroke={stitch} stroke-width=".8" stroke-dasharray="2 1.6" />
    <!-- xẻ tay + măng sét hai khuy -->
    <path d="M66 232l3 22" stroke-width="1" /><circle cx="68" cy="246" r="1.5" fill="#f4f1ea" stroke-width=".7" />
    <path d="M50 260L76 264M48 276L74 280" stroke={stitch} stroke-width=".8" stroke-dasharray="2 1.6" />
    <circle cx="56" cy="270" r="1.8" fill="#f4f1ea" stroke-width=".8" /><circle cx="64" cy="271" r="1.8" fill="#f4f1ea" stroke-width=".8" />
    <path d="M94 160L97 296M101 300Q124 316 146 311" fill="none" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M58 176q9 5 21 3M56 192q10 6 23 2M98 230q16 10 36 6M100 270q12 6 30 6M120 180q8 6 18 4" fill="none" stroke={fold} stroke-width="1" />
    <path d="M84 80Q70 96 64 140" fill="none" stroke={shine} stroke-width="2" />
  {:else if o === 'ks-xuan-he'}
    <path d="M56 127L84 139" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M120 66L134 98" stroke={stitch} stroke-width=".8" stroke-dasharray="2 1.6" />
    <!-- túi ngực ly hộp, nắp ba mũi, khuy -->
    <rect x="102" y="130" width="30" height="34" rx="2" fill="none" />
    <path d="M113 130v34M121 130v34" stroke={stitch} stroke-width=".8" />
    <path d="M100 122h34l-1 9l-6 4l-10-3l-10 3l-6-4Z" fill={p.sleeve} />
    <path d="M102 125h30" stroke={stitch} stroke-width=".7" stroke-dasharray="2 1.6" />
    <circle cx="117" cy="131" r="2.2" fill="#f4f1ea" stroke-width=".8" />
    <path d="M94 160L95 290M98 290h52" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M62 112q8 4 18 2M100 230q14 6 30 4M106 270q12 4 26 2" fill="none" stroke={fold} stroke-width="1" />
    <!-- cầu vai đỏ trơn, viền chỉ vàng, khuy -->
    <path d="M90 76L123 61L127 69L95 85Z" fill="#b8322c" stroke="#d9b45a" stroke-width="1.4" /><circle cx="119" cy="67" r="2.2" fill="#d9b45a" stroke={INK} stroke-width=".6" />
    <path d="M84 80Q70 96 62 120" fill="none" stroke={shine} stroke-width="2" />
  {:else if suit}
    <!-- bốn khuy tay, nếp tay, vai -->
    {#each [0, 1, 2, 3] as k (k)}<circle cx={55.5 + k * 1.2} cy={262 + k * 5.5} r="1.7" fill={INK} stroke="none" />{/each}
    <path d="M57 180q9 5 22 3M55 196q10 6 24 2M51 256q8 4 22 4" fill="none" stroke={fold} stroke-width="1" />
    <path d="M86 74q3 6 7 8" fill="none" stroke={fold} stroke-width="1" />
    <!-- mũi khâu tay dọc mép ve -->
    <path d="M112 104L146 182M108 98L117 70" fill="none" stroke={stitch} stroke-width="1.1" stroke-dasharray=".1 3.6" />
    {#if o === 'ks-thu-dong'}
      <!-- túi ngực ly hộp nắp ba mũi + túi dưới, khuy vàng -->
      <rect x="102" y="150" width="28" height="30" rx="2" fill={p.body} />
      <path d="M116 150v30" stroke={stitch} stroke-width=".8" />
      <path d="M100 142h32l-1 9l-6 4l-9-3l-9 3l-6-4Z" fill={p.sleeve} /><circle cx="116" cy="150" r="2.4" fill="#d9b45a" stroke-width=".7" />
      <rect x="99" y="252" width="38" height="44" rx="2" fill={p.body} />
      <path d="M97 244h42l-1 11l-7 4l-13-3l-13 3l-7-4Z" fill={p.sleeve} /><circle cx="118" cy="254" r="2.4" fill="#d9b45a" stroke-width=".7" />
      <path d="M90 76L121 62L126 70L95 85Z" fill="#b8322c" stroke="#d9b45a" stroke-width="1.4" /><circle cx="117" cy="68" r="2.2" fill="#d9b45a" stroke={INK} stroke-width=".6" />
    {:else}
      <!-- túi ngực viền + túi nắp -->
      <path d="M102 146l26-4v6l-26 4Z" fill={p.sleeve} />
      <path d="M98 252h36" stroke-width="1.2" /><path d="M98 253h36l-1 13h-34Z" fill={p.sleeve} />
      <path d="M100 258h32" stroke={stitch} stroke-width=".7" stroke-dasharray="2 1.6" />
    {/if}
    <!-- chiết ly thân trước, nếp eo -->
    <path d="M122 166Q120 216 124 248" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" fill="none" />
    <path d="M96 210q14 4 26 0M98 300q14 6 30 2M136 200q-4 30 0 60" fill="none" stroke={fold} stroke-width="1" />
    <path d="M114 98L146 184" fill="none" stroke={shine} stroke-width="1.6" />
    <path d="M84 80Q70 96 64 140" fill="none" stroke={shine} stroke-width="1.6" />
  {:else if o === 'ao-choang'}
    <!-- cầu vai, ly xếp từ cầu vai xuống, tay rộng có nếp -->
    <path d="M87 104Q120 112 150 110" stroke={stitch} stroke-width=".9" stroke-dasharray="2.5 2" fill="none" />
    {#each [98, 110, 122, 134] as x, k (x)}<path d="M{x} {108 + k * 0.6}Q{x - 6 + k} 240 {x - 16 + k * 3} 366" stroke={INK} stroke-width=".9" opacity=".55" fill="none" />{/each}
    {#each [98, 110, 122, 134] as x, k (x)}<path d="M{x + 2} {110 + k * 0.6}Q{x - 3 + k} 240 {x - 12 + k * 3} 366" stroke={shine} stroke-width="1.2" fill="none" />{/each}
    <path d="M46 160q20 10 44 8M38 200q24 12 54 8M40 230q22 8 54 6" fill="none" stroke={fold} stroke-width="1.1" />
    <path d="M40 248l55-2" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M141 104V368" stroke={stitch} stroke-width=".9" stroke-dasharray="2.5 2" />
    <path d="M76 356q36 10 72 12" fill="none" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M82 80Q62 100 50 150" fill="none" stroke={shine} stroke-width="2" />
  {:else if o === 'ao-dai'}
    <!-- đường raglan chéo từ cổ xuống nách, viền cổ vàng, xẻ tà, nếp lụa -->
    <path d="M139 62Q122 88 106 142" fill="none" stroke={stitch} stroke-width=".9" stroke-dasharray="2.5 2" />
    <path d="M139 47h11M139 59h11" stroke="#e2bf6a" stroke-width="1.4" />
    <path d="M110 176L116 196" stroke-width="1.4" /><circle cx="116" cy="196" r="1.4" fill="#e2bf6a" stroke="none" />
    <path d="M86 150q6 4 12 2M84 210q6 4 12 2M80 260q6 4 12 2" fill="none" stroke={fold} stroke-width="1" />
    <path d="M124 220Q118 300 114 380M138 214Q136 300 134 382" fill="none" stroke={fold} stroke-width="1" />
    <path d="M128 220Q124 300 122 380" fill="none" stroke={shine} stroke-width="2.4" opacity=".5" />
    <path d="M112 90Q118 130 116 170" fill="none" stroke={shine} stroke-width="2.4" opacity=".5" />
  {:else if o === 'ao-dai-nam'}
    <!-- raglan, cổ đứng viền vàng; hoa văn thọ tròn trên gấm; nếp vải -->
    <path d="M139 62Q120 88 105 142" fill="none" stroke={stitch} stroke-width=".9" stroke-dasharray="2.5 2" />
    <path d="M139 47h11M139 59h11" stroke="#e2bf6a" stroke-width="1.4" />
    <path d="M70 288L92 291" stroke="#e2bf6a" stroke-width="1.6" />
    {#each [[124, 238], [124, 296], [126, 352]] as [x, y] (y)}
      <circle cx={x} cy={y} r="13" fill="none" stroke="#e2bf6a" stroke-width="1.1" /><circle cx={x} cy={y} r="8" fill="none" stroke="#e2bf6a" stroke-width=".8" stroke-dasharray="2 1.6" /><path d="M{x} {y - 5}V{y + 5}M{x - 5} {y}H{x + 5}" stroke="#e2bf6a" stroke-width=".9" />
    {/each}
    <path d="M84 150q6 4 12 2M80 212q6 4 12 2M74 262q6 4 12 2" fill="none" stroke={fold} stroke-width="1" />
    <path d="M142 216Q140 300 140 382" fill="none" stroke={fold} stroke-width="1" />
    <path d="M110 220Q108 300 110 380" fill="none" stroke={shine} stroke-width="2.4" opacity=".45" />
    <path d="M108 90Q112 130 108 170" fill="none" stroke={shine} stroke-width="2.4" opacity=".5" />
  {:else if o === 'nhat-binh'}
    <!-- ô vuông nhật bình ở cổ ngực: viền kép, hoa văn tròn thêu; viền gấu; măng sét gấm; nếp lụa -->
    <path d="M148 66L103 77L99 125L148 134" fill="none" stroke="#7a4a14" stroke-width="1.4" />
    <path d="M147 76L109 85L107 120L147 128" fill="none" stroke="#7a4a14" stroke-width=".9" stroke-dasharray="2.5 2" />
    <circle cx="127" cy="102" r="12" fill="none" stroke="#7a4a14" stroke-width="1" /><circle cx="127" cy="102" r="6.5" fill="#8f1f2b" fill-opacity=".55" stroke="#7a4a14" stroke-width=".9" />
    <path d="M127 90V114M115 102H139M118.5 93.5l17 17M135.5 93.5l-17 17" stroke="#7a4a14" stroke-width=".6" />
    <path d="M108 358L150 360M108 368L150 370" stroke="#7a4a14" stroke-width=".9" />
    <path d="M55 289L98 293" stroke="#7a4a14" stroke-width=".9" />
    <path d="M139 47h11M139 59h11" stroke="#e2bf6a" stroke-width="1.4" />
    <path d="M88 160q6 4 12 2M80 220q8 4 16 2M70 270q8 4 16 2" fill="none" stroke={fold} stroke-width="1" />
    <path d="M140 218Q138 300 138 348" fill="none" stroke={fold} stroke-width="1" />
    <path d="M118 224Q114 300 114 348" fill="none" stroke={shine} stroke-width="2.4" opacity=".4" />
  {:else if o === 'tu-than'}
    <!-- nẹp viền hai vạt trước, nếp tay, đường may sườn, viền váy -->
    <path d="M128 59Q141 120 150 200L150 320" fill="none" stroke="#e8c46a" stroke-width="1.6" stroke-opacity=".8" />
    <path d="M129 63Q141 122 149 204" fill="none" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M46 250L78 255" stroke="#e8c46a" stroke-width="1.6" />
    <path d="M60 176q9 5 21 3M56 200q10 6 23 2M50 238q8 4 22 4M96 230q10 6 20 2M100 270q10 6 24 4" fill="none" stroke={fold} stroke-width="1" />
    <path d="M92 144L90 298" fill="none" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M84 80Q70 96 64 140" fill="none" stroke={shine} stroke-width="2" />
    <path d="M110 330L112 390M126 326L128 392" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1.2" />
    <path d="M94 366Q124 372 150 368" fill="none" stroke="#c8a24a" stroke-width="1.4" stroke-opacity=".7" />
  {:else if o === 'ba-ba'}
    <!-- cổ tròn thấp viền nẹp, thân ngắn ngang hông xẻ tà hai bên, tay rộng mềm, 2 túi đắp vuông không nắp -->
    <path d="M126 59Q138 73 150 73M127 63Q138 77 150 77" fill="none" stroke={stitch} stroke-width=".8" stroke-dasharray="2 1.6" />
    <path d="M44 258L78 262" stroke={stitch} stroke-width=".8" stroke-dasharray="2 1.6" />
    <rect x="102" y="214" width="32" height="36" rx="1" fill={p.body} /><path d="M105 219h26M105 247h26" stroke={stitch} stroke-width=".7" stroke-dasharray="2 1.6" />
    <path d="M95 246L91 276M96 246L101 276" fill="none" stroke={stitch} stroke-width=".8" />
    <path d="M92 144L95 246" fill="none" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M58 172q9 5 21 3M52 200q10 6 23 2M48 236q10 4 22 4M116 170q8 6 18 4M112 262q10 4 22 2" fill="none" stroke={fold} stroke-width="1" />
    <path d="M84 80Q70 96 64 140" fill="none" stroke={shine} stroke-width="1.4" />
  {/if}
{/snippet}

<svg class="garment" viewBox="0 0 300 400" aria-hidden="true" focusable="false" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <filter id="{uid}-cloth" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="b" />
      <feComposite in="SourceAlpha" in2="b" operator="out" result="edge" />
      <feFlood flood-color="#1c1006" flood-opacity={dark ? 0.55 : 0.3} /><feComposite in2="edge" operator="in" result="shade" />
      <feSpecularLighting in="b" surfaceScale="5" specularConstant={dark ? 0.7 : 0.35} specularExponent="14" lighting-color="#fff4dc" result="spec"><feDistantLight azimuth="240" elevation="50" /></feSpecularLighting>
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
      <feMerge result="m"><feMergeNode in="SourceGraphic" /><feMergeNode in="shade" /></feMerge>
      <feComposite in="m" in2="specIn" operator="arithmetic" k2="1" k3={dark ? 0.35 : 0.2} />
    </filter>
    <!-- vân vải -->
    <pattern id="{uid}-twill" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><path d="M0 0V3.2" stroke={dark ? '#fff' : '#000'} stroke-opacity={dark ? 0.07 : 0.05} stroke-width="1.1" /></pattern>
    <pattern id="{uid}-oxford" width="2.6" height="2.6" patternUnits="userSpaceOnUse"><path d="M0 1.3h2.6M1.3 0v2.6" stroke="#000" stroke-opacity=".045" stroke-width=".7" /></pattern>
    <pattern id="{uid}-knit" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M.5 .8l2 3l2-3" fill="none" stroke="#5a4636" stroke-opacity=".16" stroke-width=".7" /></pattern>
    <pattern id="{uid}-silk" width="34" height="400" patternUnits="userSpaceOnUse"><rect x="12" width="7" height="400" fill="#fff" fill-opacity=".07" /><rect x="22" width="2" height="400" fill="#fff" fill-opacity=".05" /></pattern>
    <pattern id="{uid}-brocade" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="5.2" fill="none" stroke="#e8c46a" stroke-opacity=".42" stroke-width=".9" /><path d="M12 7v10M7 12h10" stroke="#e8c46a" stroke-opacity=".38" stroke-width=".7" /><circle cx="0" cy="0" r="1.6" fill="#e8c46a" fill-opacity=".4" /><circle cx="24" cy="0" r="1.6" fill="#e8c46a" fill-opacity=".4" /><circle cx="0" cy="24" r="1.6" fill="#e8c46a" fill-opacity=".4" /><circle cx="24" cy="24" r="1.6" fill="#e8c46a" fill-opacity=".4" /></pattern>
    <pattern id="{uid}-rawn" width="8" height="8" patternUnits="userSpaceOnUse"><rect width="8" height="8" fill="#f1eee6" /><rect width="4" height="8" fill="#3a3d44" fill-opacity=".85" /><rect width="8" height="4" fill="#3a3d44" fill-opacity=".55" /></pattern>
    <linearGradient id="{uid}-linen" x1="0" x2="1"><stop offset="0" stop-color="#b9a582" /><stop offset=".45" stop-color="#eadcc0" /><stop offset="1" stop-color="#a8936f" /></linearGradient>
    <linearGradient id="{uid}-wood" x1="0" x2="1"><stop offset="0" stop-color="#5a3a22" /><stop offset=".5" stop-color="#9a6a42" /><stop offset="1" stop-color="#4a2e1a" /></linearGradient>
    <linearGradient id="{uid}-tie" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".25" /><stop offset=".45" stop-color="#fff" stop-opacity=".2" /><stop offset="1" stop-color="#000" stop-opacity=".3" /></linearGradient>
    <pattern id="{uid}-pat" width={pattern === 'ca-ro' ? 16 : 9} height={pattern === 'ca-ro' ? 16 : pattern === 'cham' ? 9 : 8} patternUnits="userSpaceOnUse">
      {#if pattern === 'soc-doc'}<rect width="3.4" height="9" fill={pc} />
      {:else if pattern === 'soc-chi'}<rect width="1.1" height="8" fill={pc} />
      {:else if pattern === 'ca-ro'}<rect width="16" height="2.4" fill={pc} /><rect width="2.4" height="16" fill={pc} />
      {:else if pattern === 'cham'}<circle cx="4.5" cy="4.5" r="1.5" fill={pc} />{/if}
    </pattern>
    <pattern id="{uid}-stripe" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)"><rect width="7" height="2" fill="#d8b46a" fill-opacity=".55" /></pattern>
  </defs>
  <!-- ma-nơ-canh bán thân: cột + chân đế (sau áo), cổ bọc vải lanh có núm gỗ; lót sau cổ áo cho cảm giác áo đang mặc -->
  <path d="M146 {hem}V386h8V{hem}Z" fill="url(#{uid}-wood)" stroke={INK} stroke-width="1" />
  <path d="M112 396q38-14 76 0v3H112Z" fill="url(#{uid}-wood)" stroke={INK} stroke-width="1.1" /><ellipse cx="150" cy="389" rx="12" ry="3.4" fill="#3a2414" />
  <path d="M136 {robe ? 46 : 62}V30q14-7 28 0V{robe ? 46 : 62}Z" fill="url(#{uid}-linen)" stroke={INK} stroke-width="1.2" />
  <ellipse cx="150" cy="30" rx="14" ry="4.2" fill="#e9dcc2" stroke={INK} stroke-width="1.1" />
  <path d="M146 26q4-8 8 0" fill="url(#{uid}-wood)" stroke={INK} stroke-width="1" />
  {#if !robe && o !== 'tu-than'}<path d="M126 58q24 10 48 0q-4 8-24 9q-20-1-24-9Z" fill={p.sleeve} stroke={INK} stroke-width="1" opacity=".9" />{/if}
  {#if robe}
    <!-- quần lụa trắng lộ ở hai bên tà -->
    <path d="M114 200L99 388H114L120 214ZM186 200L201 388H186L180 214Z" fill={p.shirt} stroke={INK} stroke-width="1.1" />
  {/if}
  <!-- phần nhìn thấy bên trong cổ: sơ mi + cổ sơ mi + cà vạt -->
  {#if suit || o === 'ao-choang'}
    <path d="M128 57L150 {o === 'ao-choang' ? 104 : 188}L172 57Q150 68 128 57Z" fill={p.shirt} stroke={INK} stroke-width="1.3" />
    <path d="M131 58L141 76L150 66L159 76L169 58" fill={p.shirt} stroke={INK} stroke-width="1.1" />
    {#if p.tie && neck === 'no'}
      <path d="M150 74L134 64V86ZM150 74L166 64V86Z" fill={p.tie} stroke={INK} stroke-width="1.1" /><rect x="145.5" y="68" width="9" height="12" rx="2.5" fill={p.tie} stroke={INK} stroke-width="1.1" /><path d="M136 70V82M164 70V82" stroke="rgba(255,255,255,.3)" stroke-width="1" />
    {:else if p.tie && neck !== 'mo-co'}
      <path d="M145 68h10l2 8l-7 4l-7-4Z" fill={p.tie} stroke={INK} stroke-width="1.1" />
      <path d="M144 80L150 77L156 80L{o === 'ao-choang' ? '154 104L146 104' : '161 160L150 177L139 160'}Z" fill={p.tie} stroke={INK} stroke-width="1.1" />
      {#if o === 'vest-xanh'}<path d="M144 80L150 77L156 80L161 160L150 177L139 160Z" fill="url(#{uid}-stripe)" />{/if}
      <path d="M144 80L150 77L156 80L{o === 'ao-choang' ? '154 104L146 104' : '161 160L150 177L139 160'}Z" fill="url(#{uid}-tie)" />
      <path d="M150 82q-1 6 0 10" stroke="rgba(0,0,0,.35)" stroke-width="1" fill="none" />
    {/if}
  {/if}
  {#if o === 'tu-than'}
    <!-- yếm đào lộ giữa hai vạt áo: hình thoi, dây yếm vòng sau cổ, viền thêu -->
    <path d="M127 59L136 40M173 59L164 40" fill="none" stroke={p.shirt} stroke-width="2.2" />
    <path d="M126 58Q150 84 174 58L168 150L150 206L132 150Z" fill={p.shirt} stroke={INK} stroke-width="1.2" />
    <path d="M130 66Q150 88 170 66L165 146L150 198L135 146Z" fill="none" stroke="#c8a24a" stroke-width=".9" stroke-dasharray="2.5 2" />
    <path d="M150 96q-8 8 0 18q8-10 0-18ZM150 128q-6 7 0 15q6-8 0-15Z" fill="#f4d9a8" stroke="#b98d3a" stroke-width=".7" />
  {/if}
  <g filter={F}>
    <g stroke={INK} stroke-width="1.4">
      {@render panels(false)}
      <g transform="matrix(-1 0 0 1 300 0)">{@render panels(false)}</g>
    </g>
    <!-- vân vải phủ lên chính các mảnh vải -->
    <g class="gf-tex" stroke="none" pointer-events="none">
      {@render panels(true)}
      <g transform="matrix(-1 0 0 1 300 0)">{@render panels(true)}</g>
    </g>
    {#if showPat}
      <g class="gf-pat" stroke="none" pointer-events="none">
        {@render panels(false, true)}
        <g transform="matrix(-1 0 0 1 300 0)">{@render panels(false, true)}</g>
      </g>
    {/if}
    <!-- che đường ghép gương ở giữa với áo liền thân -->
    {#if o === 'thuong-phuc'}<path d="M150 81V295" stroke={p.body} stroke-width="3.2" /><path d="M150 297.5V316.5" stroke={p.sleeve} stroke-width="2.4" />{/if}
    {#if o === 'cong-so'}<path d="M150 84V312" stroke={p.body} stroke-width="3.2" />{/if}
    {#if robe}<path d="M150 64V384" stroke={p.body} stroke-width="3.2" />{/if}{#if o === 'tu-than'}<path d="M150 322V392" stroke={p.tie ?? '#1c1a1c'} stroke-width="3.2" />{/if}{#if o === 'ba-ba'}<path d="M150 76V279" stroke={p.body} stroke-width="3.2" />{/if}
    <g stroke={INK} stroke-width="1.2">
      {@render details()}
      <g transform="matrix(-1 0 0 1 300 0)">{@render details()}</g>
    </g>
    <!-- chi tiết ở giữa / lệch -->
    <g stroke={INK} stroke-width="1.3">
      {#if o === 'thuong-phuc'}
        <!-- dải đan thừng -->
        <path d={cable(0)} fill="none" stroke={INK} stroke-width="7.6" opacity=".55" /><path d={cable(0)} fill="none" stroke={p.body} stroke-width="5.6" />
        <path d={cable(Math.PI)} fill="none" stroke={INK} stroke-width="7.6" opacity=".55" /><path d={cable(Math.PI)} fill="none" stroke={p.sleeve} stroke-width="5.6" />
        <path d="M162 84V294M166 86V294" stroke={stitch} stroke-width=".8" />
      {/if}
      {#if o === 'cong-so' || o === 'ks-xuan-he'}
        <path d="M144 {o === 'cong-so' ? 70 : 92}V{o === 'cong-so' ? 314 : 296}M156 {o === 'cong-so' ? 70 : 92}V{o === 'cong-so' ? 314 : 296}" fill="none" />
        <path d="M146.5 {o === 'cong-so' ? 72 : 94}V{o === 'cong-so' ? 312 : 294}" fill="none" stroke={stitch} stroke-width=".7" stroke-dasharray="2 1.6" />
        {#each o === 'cong-so' ? [68, 100, 136, 172, 208, 244, 280] : [112, 150, 188, 226, 264] as y, k (y)}<circle cx="150" cy={y} r={o === 'cong-so' && k === 0 ? 1.8 : 2.6} fill="#f4f1ea" stroke-width="1" /><path d="M148.8 {y - 0.6}h2.4" stroke-width=".6" />{/each}
      {/if}
      {#if o === 'ba-ba'}
        <!-- hàng nút vải (cúc bọc) giữa ngực từ cổ xuống, nẹp cài thẳng -->
        <path d="M148.4 78V280M151.6 78V280" fill="none" stroke={stitch} stroke-width=".7" />
        {#each [86, 112, 138, 164, 190, 216, 242, 266] as y (y)}<circle cx="150" cy={y} r="2.6" fill={p.sleeve} stroke-width="1" /><path d="M147.6 {y}h4.8M150 {y - 2.4}v4.8" stroke={stitch} stroke-width=".6" />{/each}
      {/if}
      {#if o === 'ks-xuan-he'}<rect x="170" y="110" width="28" height="7" rx="1.5" fill="#24314f" stroke-width="1" /><path d="M173 113.5h22" stroke="#8fa6c8" stroke-width=".8" />{/if}
      {#if o === 'cong-so'}
        <!-- dây đeo thẻ + thẻ trắng -->
        <path d="M128 60Q136 120 150 150Q164 120 172 60" fill="none" stroke="#2c5aa0" stroke-width="2.6" />
        <rect x="138" y="150" width="24" height="32" rx="2" fill="#fff" stroke-width="1.1" /><rect x="138" y="150" width="24" height="7" rx="2" fill="#2c5aa0" stroke-width="1.1" />
        <path d="M142 164h16M142 169h11" stroke="#b9c3cf" stroke-width="1.2" />
      {/if}
      {#if suit}
        {#each o === 'ks-thu-dong' ? [204, 232, 260, 288] : [214, 250] as y (y)}<circle cx="152" cy={y} r="3.4" fill={o === 'ks-thu-dong' ? '#d9b45a' : '#1a1a1d'} stroke-width="1" /><circle cx="151" cy={y - 1} r="1" fill="#fff" stroke="none" opacity=".35" />{/each}
        <!-- lỗ cài hoa trên ve trái -->
        <path d="M108 116l9-3" stroke={stitch} stroke-width="1.2" />
        {#if o === 'vest-den'}<path d="M106 145l5-10l4 7l5-9l4 8l3-3l1 5Z" fill="#f6f6f2" stroke-width=".9" />{/if}
      {/if}
      {#if o === 'ao-choang'}<path d="M150 110V368" fill="none" stroke-width="1.1" />{/if}
      {#if robe && o !== 'nhat-binh'}
        <!-- đường cài chéo từ cổ sang nách phải đặc trưng của áo dài -->
        <path d="M150 62Q172 70 196 104" fill="none" stroke-width="1.1" />
        {#each [[160, 64], [176, 74], [189, 90]] as [x, y] (x)}<circle cx={x} cy={y} r="1.8" fill="#e2bf6a" stroke-width=".8" />{/each}
        {#if o === 'ao-dai'}<!-- thêu sen trên tà trước: lá sen, cuống, hoa sen nở, nụ -->
        <g stroke="#b98d3a" stroke-width=".8">
          <path d="M124 372Q138 330 156 300M156 300Q166 286 170 270M146 322Q134 314 130 302" fill="none" stroke="#e2bf6a" stroke-width="1.4" />
          <path d="M112 352q8-22 30-20q-4 20-30 20Z" fill="#c8a24a" fill-opacity=".85" /><path d="M114 350q12-8 26-16M126 340l-4-6M132 337l-2-7" fill="none" />
          <path d="M170 270q-14-6-14-22q8 6 14 14q6-8 14-14q0 16-14 22Z" fill="#f0d488" />
          <path d="M170 270q-6-12 0-28q6 16 0 28Z" fill="#f7e2a6" /><path d="M170 270q-20 2-26-10q14-2 26 10ZM170 270q20 2 26-10q-14-2-26 10Z" fill="#e8c46a" />
          <path d="M130 302q-6-10 0-18q6 8 0 18Z" fill="#f0d488" />
        </g>{/if}
      {/if}
    </g>
  </g>
  {#if o === 'tu-than'}
    <!-- hai vạt trước buộc lỏng + thắt lưng bao lụa quanh eo, nút lệch phải, hai tà buông -->
    <g stroke={INK} stroke-width="1.2">
      <path d="M150 190Q132 178 124 192Q132 206 150 194Z" fill={p.sleeve} /><path d="M150 190Q168 178 176 192Q168 206 150 194Z" fill={p.sleeve} />
      <path d="M150 194L141 226Q146 230 151 226Z" fill={p.body} /><path d="M150 194L159 226Q154 230 149 226Z" fill={p.body} />
      <path d="M88 232Q150 250 212 232V248Q150 266 88 248Z" fill="#3f8a86" />
      <path d="M96 236Q150 252 204 236" fill="none" stroke="rgba(255,255,255,.3)" stroke-width="1" />
      <path d="M164 246Q176 238 184 246Q176 256 164 250Z" fill="#3f8a86" /><circle cx="164" cy="249" r="3.6" fill="#35756f" />
      <path d="M164 252L152 306Q158 310 164 304L170 256Z" fill="#3f8a86" /><path d="M168 252L184 300Q179 306 172 302L164 254Z" fill="#35756f" />
    </g>
  {/if}
  {#if o === 'ba-ba'}
    <!-- khăn rằn: vòng quanh cổ, thắt nút lệch phải, đuôi buông xuống ngực -->
    <g stroke={INK} stroke-width="1.2">
      <path d="M122 58Q150 82 178 58L184 74Q150 102 116 74Z" fill="url(#{uid}-rawn)" />
      <path d="M156 88L176 84L190 170L166 180Z" fill="url(#{uid}-rawn)" />
      <path d="M154 88L170 100L158 112Z" fill="url(#{uid}-rawn)" />
      <path d="M160 100L168 172M172 96L180 168" stroke="rgba(0,0,0,.22)" stroke-width=".8" fill="none" />
      <path d="M166 180L190 170L192 182L168 192Z" fill="#f1eee6" /><path d="M170 184L190 176M172 189L191 181" stroke="#3a3d44" stroke-width=".7" />
    </g>
  {/if}
  {#if o === 'ao-dai-nam'}
    <!-- khăn đóng: khăn gấm quấn nhiều lớp, nếp ngang, mối nút giữa trán -->
    <g stroke={INK} stroke-width="1.2">
      <path d="M127 31Q122 10 140 5Q150 0 160 5Q178 10 173 31Q150 39 127 31Z" fill="#232b47" />
      <path d="M130 24Q150 33 170 24M129 17Q150 27 171 17M133 10Q150 19 167 10" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="1" />
      <path d="M150 5V34" stroke="rgba(0,0,0,.45)" stroke-width="1" fill="none" />
      <path d="M127 31Q150 40 173 31V34Q150 43 127 34Z" fill="#e2bf6a" stroke-width="1" />
    </g>
  {/if}
  {#if o === 'tu-than'}
    <!-- nón quai thao: vành rộng phẳng, chóp thấp, quai lụa đỏ buông hai bên -->
    <g stroke={INK} stroke-width="1.2">
      <path d="M96 22Q100 52 112 64M204 22Q200 52 188 64" fill="none" stroke="#b3282d" stroke-width="2" />
      <ellipse cx="112" cy="68" rx="3.4" ry="7" fill="#b3282d" /><ellipse cx="188" cy="68" rx="3.4" ry="7" fill="#b3282d" />
      <ellipse cx="150" cy="22" rx="58" ry="13" fill="#2b2420" />
      <ellipse cx="150" cy="21" rx="47" ry="9.4" fill="none" stroke="#6a5846" stroke-width=".9" /><ellipse cx="150" cy="20" rx="34" ry="6.4" fill="none" stroke="#6a5846" stroke-width=".7" />
      <path d="M130 19Q132 4 150 3Q168 4 170 19Q150 24 130 19Z" fill="#3a2e26" />
      <path d="M104 28Q150 50 196 28" fill="none" stroke="#b3282d" stroke-width="1.6" />
    </g>
  {/if}
  <!-- phụ kiện cài áo (ngực): ghim cán cân · hoa sen · sách · trống đồng nhỏ; khăn lụa quanh cổ -->
  {#if adorn === 'khan-lua' && !robe}
    <path d="M126 59Q150 78 174 59L170 70Q150 88 130 70Z" fill={SCARF[o] ?? '#b3282d'} stroke={INK} stroke-width="1.1" />
    <path d="M138 80L150 98L162 80Q150 88 138 80Z" fill={SCARF[o] ?? '#b3282d'} stroke={INK} stroke-width="1" />
    <path d="M132 66Q150 80 168 66" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.2" />
  {:else if adorn !== 'khong' && adorn !== 'khan-lua'}
    <g transform="translate({robe ? 119 : o === 'ao-choang' ? 114 : 112} {robe ? 134 : 124})" stroke="#6b4c14" stroke-width=".9">
      <circle r="11" fill="#f1d896" stroke-width="1.3" /><circle r="8.4" fill="none" stroke="#b98d3a" stroke-width=".7" />
      {#if adorn === 'ghim-can'}
        <path d="M0-6V6M-6-3Q0-5 6-3M-6-3l-2.4 5h4.8zM6-3l-2.4 5h4.8zM-3 6h6" fill="none" stroke="#5b3d0e" stroke-width="1" />
      {:else if adorn === 'ghim-sen'}
        <path d="M0 5Q-6 0 0-6Q6 0 0 5ZM0 5Q-8 4-7-3Q-1 0 0 5ZM0 5Q8 4 7-3Q1 0 0 5Z" fill="#e8a0a6" stroke="#8c3b44" stroke-width=".8" />
      {:else if adorn === 'ghim-sach'}
        <path d="M-6-5Q-3-6 0-4Q3-6 6-5V5Q3 4 0 6Q-3 4-6 5Z" fill="#8c2f28" stroke="#5b3d0e" stroke-width=".9" /><path d="M0-4V6" stroke="#f1d896" stroke-width=".9" />
      {:else}
        <circle r="5" fill="none" stroke="#5b3d0e" stroke-width="1" /><circle r="1.8" fill="#5b3d0e" stroke="none" /><path d="M0-5.6V-8M0 5.6V8M-5.6 0H-8M5.6 0H8M4-4l1.8-1.8M-4-4l-1.8-1.8M4 4l1.8 1.8M-4 4l-1.8 1.8" stroke="#5b3d0e" stroke-width=".9" />
      {/if}
    </g>
  {/if}
</svg>
