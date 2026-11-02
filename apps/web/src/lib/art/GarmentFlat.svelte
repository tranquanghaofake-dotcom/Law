<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Bản vẽ kỹ thuật trang phục (technical flat): mặt trước, nét mảnh đều, đường may nét đứt, tô một màu phẳng.
  // Vẽ nửa trái rồi lật gương sang nửa phải để luôn đối xứng; chi tiết lệch (khuy, thẻ tên, cà vạt) vẽ riêng.
  // Không quân hàm, cấp hiệu, Quốc huy, huân chương; cầu vai kiểm sát là dải đỏ trơn viền chỉ vàng.
  // Chất liệu (filter `cloth`, gắn vào từng mảng vải chính): mép tối dần như bóng đổ, ánh đèn trên-trái tạo độ bóng,
  // hạt thớ vải rất mịn. Nếp gấp vẽ bằng nét mờ.
  let { outfit }: { outfit: string } = $props();
  const uid = `gf${++seq}`;
  const F = `url(#${uid}-cloth)`;
  const INK = '#2b2420';
  type Pal = { body: string; sleeve: string; shirt: string; tie: string | null };
  const PAL: Record<string, Pal> = {
    'thuong-phuc': { body: '#ece2cf', sleeve: '#e0d4bd', shirt: '#ece2cf', tie: null },
    'cong-so': { body: '#fbfbf8', sleeve: '#eef0f1', shirt: '#fbfbf8', tie: null },
    'vest-xanh': { body: '#2f4570', sleeve: '#283c62', shirt: '#cfe0f4', tie: '#7a2433' },
    'vest-den': { body: '#2a2b30', sleeve: '#222328', shirt: '#fbfbf8', tie: '#b3282d' },
    'ao-choang': { body: '#232327', sleeve: '#1c1c20', shirt: '#fbfbf8', tie: '#2a2b30' },
    'ks-xuan-he': { body: '#a9c8ea', sleeve: '#9bbde2', shirt: '#a9c8ea', tie: null },
    'ks-thu-dong': { body: '#27365a', sleeve: '#213050', shirt: '#fbfbf8', tie: '#27365a' },
    'ao-dai': { body: '#a8322b', sleeve: '#982c26', shirt: '#f6f1e6', tie: null },
  };
  const o = $derived(PAL[outfit] ? outfit : 'thuong-phuc');
  const p = $derived(PAL[o]);
  const dark = $derived(o === 'vest-den' || o === 'ao-choang' || o === 'ks-thu-dong' || o === 'vest-xanh');
  const stitch = $derived(dark ? '#8d8f99' : '#7d7064');
  const fold = $derived(dark ? 'rgba(0,0,0,.55)' : 'rgba(80,60,40,.35)');
  const shine = $derived(dark ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.7)');
  const suit = $derived(o === 'vest-xanh' || o === 'vest-den' || o === 'ks-thu-dong');
</script>

{#snippet sleeveLong(len: number)}
  <path d="M86 73C70 81 61 110 56 168L49 {len}L76 {len + 4}L81 186Q86 156 92 142Z" fill={p.sleeve} />
  <path d="M57 176q9 5 22 3M55 192q10 6 24 2M62 120q8 2 16-2M51 {len - 30}q8 4 22 4" fill="none" stroke={fold} stroke-width="1" />
  <path d="M84 80Q70 96 64 140" fill="none" stroke={shine} stroke-width="2" />
{/snippet}

{#snippet half()}
  {#if o === 'thuong-phuc'}
    {@render sleeveLong(272)}
    <path d="M49 272L76 276L74 296L47 292Z" fill={p.sleeve} />
    <path d="M51 278L75 282M50 284L74 288" stroke={stitch} stroke-width=".8" />
    <path d="M150 70Q133 70 124 57L86 73Q90 110 92 142L95 296L150 296Z" fill={p.body} />
    <path d="M95 296L150 296V316H96Z" fill={p.sleeve} />
    <path d="M100 250q14 8 30 4M98 200q10 4 20 2M118 280q10-6 24-2" fill="none" stroke={fold} stroke-width="1" />
    {#each [104, 114, 124, 134, 144] as x (x)}<path d="M{x} 299V313" stroke={stitch} stroke-width=".8" />{/each}
    <path d="M124 57Q130 76 150 78" fill="none" /><path d="M128 56Q134 70 150 71" fill="none" stroke={stitch} stroke-width=".8" stroke-dasharray="none" />
  {:else if o === 'cong-so'}
    {@render sleeveLong(256)}
    <path d="M49 256L76 260L74 284L47 280Z" fill={p.sleeve} />
    <path d="M150 74Q133 72 124 57L86 73Q90 110 92 142L96 298Q122 320 150 314Z" fill={p.body} />
    <path d="M150 74L124 57Q118 66 121 72L138 98L150 82Z" fill={p.body} />
    <rect x="104" y="120" width="25" height="27" rx="1.5" fill="none" />
    <path d="M98 230q16 10 36 6M100 270q12 6 30 6M120 180q8 6 18 4" fill="none" stroke={fold} stroke-width="1" />
    <path d="M107 124h19" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M101 300Q124 316 146 311M57 172L52 252" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" fill="none" />
  {:else if o === 'ks-xuan-he'}
    <path d="M86 73C70 81 60 100 53 132L84 144L92 140Z" fill={p.sleeve} />
    <path d="M56 126L84 137" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M150 74Q133 72 124 57L86 73Q90 110 92 142L95 296L150 296Z" fill={p.body} />
    <path d="M150 82L124 57Q117 64 118 72L136 104L150 90Z" fill={p.body} />
    <!-- túi ngực có nắp + ly giữa -->
    <rect x="102" y="128" width="30" height="34" rx="2" fill={p.body} />
    <path d="M100 120h34l-2 12h-30Z" fill={p.sleeve} /><path d="M117 128v34" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <circle cx="117" cy="128" r="2" fill="#f4f1ea" />
    <path d="M98 290h52" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <!-- cầu vai đỏ trơn, viền chỉ vàng -->
    <path d="M90 76L123 61L127 69L95 85Z" fill="#b8322c" stroke="#d9b45a" stroke-width="1.4" /><circle cx="119" cy="67" r="2.2" fill="#d9b45a" stroke="none" />
  {:else if suit}
    {@render sleeveLong(286)}
    {#each [0, 7, 14] as k (k)}<circle cx={60 + k * 0.5} cy={276 - k * 0.2} r="1.8" fill={INK} stroke="none" />{/each}
    <path d="M128 57L84 72Q89 110 92 146L94 330Q120 338 140 334Q149 324 149 300L148 190Z" fill={p.body} />
    <!-- ve áo (ve chữ K) -->
    <path d="M128 57L116 65L104 96L114 98L108 108L148 190L150 186Z" fill={p.sleeve} />
    {#if o === 'ks-thu-dong'}
      <path d="M102 136h30l-2 12h-26Z" fill={p.sleeve} /><rect x="104" y="148" width="26" height="28" rx="2" fill={p.body} />
      <path d="M100 236h36l-2 14h-32Z" fill={p.sleeve} />
      <path d="M90 76L121 62L126 70L95 85Z" fill="#b8322c" stroke="#d9b45a" stroke-width="1.4" /><circle cx="117" cy="68" r="2.2" fill="#d9b45a" stroke="none" />
    {:else}
      <path d="M104 142l24-3" stroke-width="2.2" />
      <path d="M100 256l34-2v8l-34 2Z" fill={p.sleeve} />
    {/if}
    <path d="M124 160Q122 220 126 250" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" fill="none" />
    <path d="M96 210q14 4 26 0M98 300q14 6 30 2M138 196q-4 30 0 60" fill="none" stroke={fold} stroke-width="1" />
    <path d="M114 98L146 184" fill="none" stroke={shine} stroke-width="1.6" />
  {:else if o === 'ao-choang'}
    <path d="M84 72C60 86 42 142 30 236L40 254L96 252Q92 190 92 142Z" fill={p.sleeve} />
    <path d="M34 236L40 254L96 252L95 240Z" fill={p.body} />
    <path d="M128 57L84 72Q80 200 70 366L150 370V100Z" fill={p.body} />
    <path d="M130 57L150 100" fill="none" />
    <path d="M90 104Q120 112 150 110" stroke={stitch} stroke-width=".9" stroke-dasharray="2.5 2" fill="none" />
    {#each [104, 118, 134] as x (x)}<path d="M{x} 112Q{x - 8 + (x - 104) * 0.1} 240 {x - 18 + (x - 104) * 0.3} 366" stroke={INK} stroke-width=".9" opacity=".6" fill="none" />{/each}
  {:else if o === 'ao-dai'}
    <path d="M102 76C90 90 84 130 80 200L74 286L90 288L96 204Q102 160 106 142Z" fill={p.sleeve} />
    <path d="M150 62H139L102 76Q106 110 106 142Q104 160 110 176L116 196Q108 300 100 384L150 386Z" fill={p.body} />
    <rect x="137" y="44" width="13" height="19" rx="2" fill={p.body} />
    <path d="M140 49h10M140 56h10" stroke={stitch} stroke-width=".8" stroke-dasharray="2.5 2" />
    <path d="M116 196L106 200" />
    <path d="M120 230q-4 70-10 140M134 210q-2 80-4 168" fill="none" stroke={fold} stroke-width="1" />
    <path d="M112 90Q118 130 116 170" fill="none" stroke={shine} stroke-width="2.4" />
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
      <feTurbulence type="fractalNoise" baseFrequency={suit || o === 'ao-choang' ? '.9 .25' : '.85'} numOctaves="2" seed="4" result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  {dark ? 0.2 : 0.05} 0 0 0 0" result="na" />
      <feComposite in="na" in2="SourceAlpha" operator="in" result="grain" />
      <feMerge result="m"><feMergeNode in="SourceGraphic" /><feMergeNode in="grain" /><feMergeNode in="shade" /></feMerge>
      <feComposite in="m" in2="specIn" operator="arithmetic" k2="1" k3={dark ? 0.35 : 0.2} />
    </filter>
  </defs>
  <!-- ma-nơ-canh bán thân: cột + chân đế (sau áo), cổ bọc vải lanh có núm gỗ; lót sau cổ áo cho cảm giác áo đang mặc -->
  <defs>
    <linearGradient id="{uid}-linen" x1="0" x2="1"><stop offset="0" stop-color="#b9a582" /><stop offset=".45" stop-color="#eadcc0" /><stop offset="1" stop-color="#a8936f" /></linearGradient>
    <linearGradient id="{uid}-wood" x1="0" x2="1"><stop offset="0" stop-color="#5a3a22" /><stop offset=".5" stop-color="#9a6a42" /><stop offset="1" stop-color="#4a2e1a" /></linearGradient>
  </defs>
  <path d="M146 200V386h8V200Z" fill="url(#{uid}-wood)" stroke={INK} stroke-width="1" />
  <path d="M112 396q38-14 76 0v3H112Z" fill="url(#{uid}-wood)" stroke={INK} stroke-width="1.1" /><ellipse cx="150" cy="389" rx="12" ry="3.4" fill="#3a2414" />
  <path d="M136 {o === 'ao-dai' ? 46 : 62}V30q14-7 28 0V{o === 'ao-dai' ? 46 : 62}Z" fill="url(#{uid}-linen)" stroke={INK} stroke-width="1.2" />
  <ellipse cx="150" cy="30" rx="14" ry="4.2" fill="#e9dcc2" stroke={INK} stroke-width="1.1" />
  <path d="M146 26q4-8 8 0" fill="url(#{uid}-wood)" stroke={INK} stroke-width="1" />
  {#if o !== 'ao-dai'}<path d="M126 58q24 10 48 0q-4 8-24 9q-20-1-24-9Z" fill={p.sleeve} stroke={INK} stroke-width="1" opacity=".9" />{/if}
  <!-- phần nhìn thấy bên trong cổ: sơ mi + cà vạt -->
  {#if suit || o === 'ao-choang'}
    <path d="M128 57L150 {o === 'ao-choang' ? 104 : 188}L172 57Q150 68 128 57Z" fill={p.shirt} stroke={INK} stroke-width="1.3" />
    <path d="M136 58L150 72L164 58" fill="none" stroke={INK} stroke-width="1.1" />
    {#if p.tie}
      <path d="M145 70h10l2 8l-7 4l-7-4Z" fill={p.tie} stroke={INK} stroke-width="1.1" />
      <path d="M144 82L150 79L156 82L{o === 'ao-choang' ? '154 104L146 104' : '160 160L150 176L140 160'}Z" fill={p.tie} stroke={INK} stroke-width="1.1" />
    {/if}
  {/if}
  <g stroke={INK} stroke-width="1.4" filter={F}>
    {@render half()}
    <g transform="matrix(-1 0 0 1 300 0)">{@render half()}</g>
  </g>
  <!-- che đường ghép gương ở giữa với áo liền thân -->
  {#if o === 'thuong-phuc'}<path d="M150 72V295" stroke={p.body} stroke-width="3.2" /><path d="M150 297.5V314.5" stroke={p.sleeve} stroke-width="2.4" />{/if}
  {#if o === 'cong-so'}<path d="M150 84V312" stroke={p.body} stroke-width="3.2" />{/if}
  {#if o === 'ao-dai'}
    <path d="M150 64V384" stroke={p.body} stroke-width="3.2" />
    <!-- thêu hoa mai trên tà trước: cành cong + hoa năm cánh -->
    <path d="M124 372Q130 330 158 306Q170 296 176 280M146 320Q140 306 144 294M160 304Q172 306 178 300" fill="none" stroke="#e2bf6a" stroke-width="1.3" stroke-linecap="round" />
    {#each [[144, 292, 4.2], [176, 278, 4.8], [178, 300, 3.6], [132, 344, 3.8]] as [x, y, r] (x)}
      <g transform="translate({x} {y})" fill="#f0d488" stroke="#b98d3a" stroke-width=".6">{#each [0, 72, 144, 216, 288] as a (a)}<circle cx={Math.cos((a * Math.PI) / 180) * r * 0.55} cy={Math.sin((a * Math.PI) / 180) * r * 0.55} r={r * 0.5} />{/each}<circle r={r * 0.28} fill="#b98d3a" stroke="none" /></g>
    {/each}
  {/if}
  <!-- chi tiết ở giữa / lệch -->
  <g stroke={INK} stroke-width="1.3">
    {#if o === 'cong-so' || o === 'ks-xuan-he'}
      <path d="M144 {o === 'cong-so' ? 82 : 92}V{o === 'cong-so' ? 314 : 296}M156 {o === 'cong-so' ? 82 : 92}V{o === 'cong-so' ? 314 : 296}" fill="none" />
      {#each o === 'cong-so' ? [100, 136, 172, 208, 244, 280] : [112, 150, 188, 226, 264] as y (y)}<circle cx="150" cy={y} r="2.6" fill="#f4f1ea" stroke-width="1" />{/each}
    {/if}
    {#if o === 'ks-xuan-he'}<rect x="170" y="110" width="28" height="7" rx="1.5" fill="#24314f" stroke-width="1" />{/if}
    {#if o === 'cong-so'}
      <!-- dây đeo thẻ + thẻ trắng -->
      <path d="M128 60Q136 120 150 150Q164 120 172 60" fill="none" stroke="#2c5aa0" stroke-width="2.6" />
      <rect x="138" y="150" width="24" height="32" rx="2" fill="#fff" stroke-width="1.1" /><rect x="138" y="150" width="24" height="7" rx="2" fill="#2c5aa0" stroke-width="1.1" />
    {/if}
    {#if suit}
      {#each o === 'ks-thu-dong' ? [204, 232, 260, 288] : [214, 250] as y (y)}<circle cx="152" cy={y} r="3.4" fill={o === 'ks-thu-dong' ? '#d9b45a' : '#1a1a1d'} stroke-width="1" />{/each}
    {/if}
    {#if o === 'ao-choang'}<path d="M150 110V368" fill="none" stroke-width="1.1" />{/if}
    {#if o === 'ao-dai'}
      <!-- đường cài chéo từ cổ sang nách phải đặc trưng của áo dài -->
      <path d="M150 62Q172 70 196 104" fill="none" stroke-width="1.1" />
      {#each [[160, 64], [176, 74], [189, 90]] as [x, y] (x)}<circle cx={x} cy={y} r="1.8" fill="#e2bf6a" stroke-width=".8" />{/each}
    {/if}
  </g>
</svg>
