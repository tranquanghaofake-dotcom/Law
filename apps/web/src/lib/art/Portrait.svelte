<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Chân dung chibi toàn thân (phong cách nét nâu mềm, mắt to có tròng chuyển màu và đốm sáng) — nhân vật chung, không mô phỏng người thật.
  // `avatar.outfit` ở đây là trang phục đã giải (cong-so, vest-xanh, vest-den, ao-choang, ks-xuan-he, ks-thu-dong, thuong-phuc, ao-dai).
  // Áo choàng xét xử đen dài tay; kiểm sát xanh dương + cầu vai đỏ trơn — không vẽ sao, biểu tượng, Quốc huy.
  import type { Avatar } from '$lib/game/wardrobe';
  import type { ArtName } from './registry';
  import { ring } from './kit';
  let { avatar, scene = 'tam-quan', accent = '#3f9e63' }: { avatar: Avatar; scene?: ArtName; accent?: string } = $props();
  const uid = `pt${++seq}`;
  const kind = $derived(scene === 'quoc-hoi' ? 'quoc-hoi' : scene === 'toa-an' ? 'toa-an' : scene === 'ngo-mon' ? 'tru-so' : 'dinh');
  const o = $derived(avatar.outfit);
  const L = '#3d2f2c', SKIN = '#ffe8da', BLUSH = '#f7aea6';
  const HAIR = $derived(avatar.hair === 'dai' ? { c: '#5a3a2b', h: '#8a5f45' } : { c: '#2a2a33', h: '#565667' });
  // màu theo trang phục: áo, tay áo, quần, giày
  const C = $derived(({
    'thuong-phuc': { top: '#f2e3c6', sleeve: '#f2e3c6', pants: '#7a5236', shoe: '#f4f4f4' },
    'cong-so': { top: '#ffffff', sleeve: '#ffffff', pants: '#2e3440', shoe: '#1d1d22' },
    'vest-xanh': { top: '#2f4a7a', sleeve: '#2f4a7a', pants: '#2f4a7a', shoe: '#1d1d22' },
    'vest-den': { top: '#23252b', sleeve: '#23252b', pants: '#23252b', shoe: '#111114' },
    'ao-choang': { top: '#1f1f24', sleeve: '#1f1f24', pants: '#1f1f24', shoe: '#111114' },
    'ks-xuan-he': { top: '#79a8e6', sleeve: '#79a8e6', pants: '#25324f', shoe: '#111114' },
    'ks-thu-dong': { top: '#2b3d63', sleeve: '#2b3d63', pants: '#25324f', shoe: '#111114' },
    'ao-dai': { top: '#c0392b', sleeve: '#c0392b', pants: '#ffffff', shoe: '#c0392b' },
  } as Record<string, { top: string; sleeve: string; pants: string; shoe: string }>)[o] ?? { top: '#f2e3c6', sleeve: '#f2e3c6', pants: '#7a5236', shoe: '#f4f4f4' });
  const star = (x: number, y: number, r: number) => `M${x} ${y - r}Q${x + r * 0.18} ${y - r * 0.18} ${x + r} ${y}Q${x + r * 0.18} ${y + r * 0.18} ${x} ${y + r}Q${x - r * 0.18} ${y + r * 0.18} ${x - r} ${y}Q${x - r * 0.18} ${y - r * 0.18} ${x} ${y - r}z`;
  const stars = [[48, 70, 9], [254, 96, 7], [236, 44, 5], [58, 176, 5], [262, 196, 8]];
  const longSleeve = $derived(o !== 'ks-xuan-he');
</script>

<svg class="portrait-chibi" viewBox="0 0 300 400" aria-hidden="true" focusable="false" stroke-linecap="round" stroke-linejoin="round">
  <defs>
    <clipPath id="{uid}-clip"><rect x="14" y="14" width="272" height="372" rx="22" /></clipPath>
    <linearGradient id="{uid}-iris" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1a14" /><stop offset=".55" stop-color="#4a2e22" /><stop offset="1" stop-color="#8a5a3c" /></linearGradient>
    <radialGradient id="{uid}-blush"><stop offset="0" stop-color={BLUSH} stop-opacity=".9" /><stop offset="1" stop-color={BLUSH} stop-opacity="0" /></radialGradient>
    <linearGradient id="{uid}-shade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#000" stop-opacity=".12" /></linearGradient>
  </defs>
  <rect width="300" height="400" rx="28" fill={accent} />
  <rect x="14" y="14" width="272" height="372" rx="22" fill="#fffdf9" />
  <g clip-path="url(#{uid}-clip)">
    <!-- nền: vầng sáng, mặt trống đồng, trụ sở, sao -->
    {#if avatar.effect !== 'khong'}<circle cx="150" cy="150" r="112" fill={accent} opacity=".12" />{/if}
    {#if avatar.effect === 'trong-dong' || avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
      <g class="sun-spin" opacity=".5"><path d={ring(150, 150, 104, 116, 46)} fill={accent} opacity=".45" /><circle cx="150" cy="150" r="98" fill="none" stroke={accent} stroke-width="2" stroke-dasharray="2 6" /></g>
    {/if}
    <g fill={accent} fill-opacity=".1" stroke={L} stroke-opacity=".22" stroke-width="2.2">
      {#if kind === 'quoc-hoi'}
        <rect x="40" y="250" width="220" height="110" /><rect x="104" y="222" width="92" height="28" /><ellipse cx="150" cy="222" rx="46" ry="7" />
        <path d="M54 262v86M76 262v86M98 262v86M202 262v86M224 262v86M246 262v86" fill="none" />
      {:else if kind === 'toa-an'}
        <path d="M44 266l106-54l106 54z" /><rect x="52" y="266" width="196" height="96" />
        <path d="M70 276v80M96 276v80M204 276v80M230 276v80" fill="none" />
      {:else if kind === 'tru-so'}
        <rect x="30" y="262" width="240" height="100" /><path d="M20 262q24-22 46-14h168q22-8 46 14z" /><rect x="116" y="222" width="68" height="40" /><path d="M106 224q22-20 44-14q22-6 44 14z" />
      {:else}
        <path d="M30 270q18-24 44-20h152q26-4 44 20z" /><rect x="48" y="270" width="204" height="92" /><path d="M126 362v-38a24 24 0 0 1 48 0v38" fill="none" />
      {/if}
    </g>
    <rect x="14" y="362" width="272" height="24" fill={accent} opacity=".14" />
    {#if avatar.effect === 'hat-sang' || avatar.effect === 'nang'}
      <g class="sparks" fill={accent} stroke={L} stroke-width="1.5">{#each stars.slice(0, avatar.effect === 'nang' ? 2 : 5) as [x, y, r], i (i)}<path d={star(x, y, r)} style="animation-delay:{i * 0.35}s" />{/each}</g>
    {/if}

    <g stroke={L} stroke-width="2.6">
      <!-- tóc sau -->
      {#if avatar.hair === 'dai'}<path d="M72 150C66 82 112 58 150 58C190 58 236 82 228 150L234 296Q150 316 66 296Z" fill={HAIR.c} />{/if}
      {#if avatar.hair === 'buoc'}<path d="M206 98q54 8 46 84q-6 44-30 66q10-44-4-74q-6-30-12-76z" fill={HAIR.c} /><path d="M206 98l14-12l6 14l-12 6z" fill={accent} />{/if}
      <!-- chân, giày -->
      {#if o === 'ao-dai'}
        <path d="M118 318h64v42h-64z" fill={C.pants} />
      {:else if o !== 'ao-choang'}
        <path d="M118 300h30v56h-30zM152 300h30v56h-30z" fill={C.pants} />
        <path d="M150 304v50" fill="none" stroke-width="1.6" opacity=".5" />
      {/if}
      <g fill={C.shoe}><path d="M110 352q0-8 10-8h28v14h-34q-4 0-4-6z" /><path d="M190 352q0-8-10-8h-28v14h34q4 0 4-6z" /></g>
      <!-- thân + tay -->
      {#if o === 'ao-choang'}
        <path d="M100 218q-26 50-30 136h160q-4-86-30-136z" fill={C.top} />
        <path d="M150 232v120" fill="none" stroke="#4a4a52" stroke-width="2" />
        <path d="M100 222q-30 26-36 78h30q2-34 18-58z" fill={C.sleeve} /><path d="M200 222q30 26 36 78h-30q-2-34-18-58z" fill={C.sleeve} />
      {:else if o === 'ao-dai'}
        <path d="M104 214q-14 50-12 128h116q2-78-12-128z" fill={C.top} />
        <path d="M112 300q19-8 38 0t38 0M106 326q22-8 44 0t44 0" fill="none" stroke="#e8c45a" stroke-width="2.4" />
        <path d="M102 222q-22 30-20 74h20q-2-30 12-52z" fill={C.sleeve} /><path d="M198 222q22 30 20 74h-20q2-30-12-52z" fill={C.sleeve} />
      {:else}
        <path d="M104 214q-10 44-8 92h108q2-48-8-92z" fill={C.top} />
        <path d="M104 214q-10 44-8 92h108q2-48-8-92z" fill="url(#{uid}-shade)" stroke="none" />
        <path d="M102 222q-22 30-20 74h20q-2-30 12-52z" fill={longSleeve ? C.sleeve : SKIN} /><path d="M198 222q22 30 20 74h-20q2-30-12-52z" fill={longSleeve ? C.sleeve : SKIN} />
        {#if !longSleeve}<path d="M102 222q-14 16-18 34h18l10-30zM198 222q14 16 18 34h-18l-10-30z" fill={C.sleeve} />{/if}
      {/if}
      <!-- chi tiết trang phục -->
      {#if o === 'thuong-phuc'}
        <path d="M130 216q20 14 40 0" fill="none" /><path d="M100 300h100" fill="none" stroke-width="2" opacity=".5" />
      {:else if o === 'cong-so'}
        <path d="M134 214l16 18l16-18l-4 18l-12-4l-12 4z" fill="#fff" />
        <path d="M150 232v70" fill="none" stroke-width="1.6" /><g fill={L} stroke="none"><circle cx="150" cy="248" r="1.8" /><circle cx="150" cy="268" r="1.8" /><circle cx="150" cy="288" r="1.8" /></g>
        <path d="M136 216l14 44l14-44" fill="none" stroke={accent} stroke-width="3" />
        <rect x="139" y="258" width="22" height="28" rx="3" fill="#fff" stroke-width="2" /><rect x="139" y="258" width="22" height="7" rx="2" fill={accent} stroke-width="2" />
      {:else if o === 'vest-xanh' || o === 'vest-den' || o === 'ks-thu-dong'}
        <path d="M134 214l16 24l16-24z" fill={o === 'vest-xanh' ? '#dbe8fb' : '#fff'} />
        <path d="M146 222h8l3 6l-4 36l-3 5l-3-5l-4-36z" fill={o === 'vest-den' ? '#c0392b' : o === 'ks-thu-dong' ? '#25324f' : '#8a2b2b'} stroke-width="1.8" />
        <path d="M134 214l14 34l-20-10zM166 214l-14 34l20-10z" fill={C.top} stroke-width="2.2" />
        <path d="M150 248v54" fill="none" stroke-width="1.6" /><g fill={L} stroke="none"><circle cx="150" cy="268" r="2" /><circle cx="150" cy="286" r="2" /></g>
        {#if o === 'ks-thu-dong'}<g fill="#c0392b" stroke-width="2"><path d="M104 216l26 4l-2 9l-26-4zM196 216l-26 4l2 9l26-4z" /></g>{/if}
        {#if o === 'vest-den'}<circle cx="124" cy="240" r="4" fill="#e8c45a" stroke-width="1.6" />{/if}
      {:else if o === 'ao-choang'}
        <path d="M134 214l16 18l16-18l-4 16h-24z" fill="#fff" /><path d="M146 226h8l2 6l-3 22l-3 4l-3-4l-3-22z" fill="#6e1f1f" stroke-width="1.6" />
      {:else if o === 'ks-xuan-he'}
        <path d="M134 214l16 16l16-16l-4 16l-12-4l-12 4z" fill={C.top} /><path d="M150 230v72" fill="none" stroke-width="1.6" />
        <g fill="#c0392b" stroke-width="2"><path d="M104 216l26 4l-2 9l-26-4zM196 216l-26 4l2 9l26-4z" /></g>
        <rect x="160" y="246" width="26" height="8" rx="1.5" fill="#25324f" stroke-width="1.6" /><rect x="114" y="250" width="20" height="16" rx="2" fill={C.top} stroke-width="1.8" />
      {:else if o === 'ao-dai'}
        <path d="M132 210h36v14q-18 6-36 0z" fill="#e8c45a" />
      {/if}
      <!-- tay -->
      <g fill={SKIN}><circle cx="92" cy="300" r="11" /><circle cx="208" cy="300" r="11" /></g>
      {#if avatar.accessory === 'so'}<g transform="rotate(-14 196 270)"><rect x="178" y="246" width="40" height="50" rx="4" fill="#8b4a3a" /><rect x="183" y="252" width="30" height="8" rx="2" fill="#e8c45a" stroke-width="1.4" /></g><circle cx="200" cy="284" r="10" fill={SKIN} />{/if}
      {#if avatar.accessory === 'cap'}<rect x="196" y="304" width="44" height="34" rx="5" fill="#9a6b3f" /><path d="M210 304v-7h16v7M196 318h44" fill="none" /><rect x="214" y="314" width="8" height="8" rx="1.5" fill="#e8c45a" stroke-width="1.4" />{/if}
      <!-- cổ, tai, đầu -->
      <path d="M140 200v18q10 6 20 0v-18z" fill={SKIN} />
      <circle cx="80" cy="152" r="13" fill={SKIN} /><circle cx="220" cy="152" r="13" fill={SKIN} />
      <ellipse cx="150" cy="142" rx="72" ry="68" fill={SKIN} />
      <!-- tóc trước -->
      {#if avatar.hair === 'dai'}
        <path d="M80 142C78 86 116 66 150 66C186 66 224 86 220 142C210 120 200 110 188 108L184 130C176 114 164 106 150 106C136 106 124 114 116 130L112 108C100 110 90 122 80 142Z" fill={HAIR.c} />
        <path d="M80 142q-8 54 2 98q10-34 8-90zM220 142q8 54-2 98q-10-34-8-90z" fill={HAIR.c} />
        <rect x="186" y="94" width="20" height="7" rx="3.5" fill={accent} stroke-width="1.8" transform="rotate(-24 196 98)" />
      {:else}
        <path d="M76 150C66 86 110 60 150 60C196 60 236 88 224 150C216 128 206 118 196 114C200 128 196 136 190 140C186 124 178 116 166 112C168 126 162 134 156 138C152 122 144 116 132 114C134 126 128 134 120 138C116 124 110 118 102 116C96 126 88 136 76 150Z" fill={HAIR.c} />
        <path d="M146 62q4-20 20-24q-6 10-4 22M128 64q-6-14 2-26q2 12 8 22" fill={HAIR.c} />
      {/if}
      <path d={avatar.hair === 'dai' ? 'M112 82q36-16 76 0' : 'M104 86q40-18 86-4'} fill="none" stroke={HAIR.h} stroke-width="5" opacity=".75" />
    </g>
    <!-- mặt -->
    <g>
      <ellipse cx="124" cy="156" rx="13" ry="16" fill="url(#{uid}-iris)" stroke={L} stroke-width="2" />
      <ellipse cx="176" cy="156" rx="13" ry="16" fill="url(#{uid}-iris)" stroke={L} stroke-width="2" />
      <path d="M108 146q16-12 32 0M160 146q16-12 32 0" fill="none" stroke={L} stroke-width="3.4" />
      <g fill="#fff"><circle cx="119" cy="149" r="4.6" /><circle cx="171" cy="149" r="4.6" /><circle cx="129" cy="162" r="2" /><circle cx="181" cy="162" r="2" /></g>
      <ellipse cx="106" cy="180" rx="14" ry="8" fill="url(#{uid}-blush)" /><ellipse cx="194" cy="180" rx="14" ry="8" fill="url(#{uid}-blush)" />
      <path d="M143 184q7 6 14 0" fill="none" stroke={L} stroke-width="2.4" />
    </g>
    <!-- phụ kiện trên mặt / ngực -->
    {#if avatar.accessory === 'kinh'}
      <g fill="none" stroke={L} stroke-width="2.6"><circle cx="124" cy="157" r="19" /><circle cx="176" cy="157" r="19" /><path d="M143 154h14M105 152l-22-4M195 152l22-4" /></g>
    {:else if avatar.accessory === 'but'}
      <g stroke={L} stroke-width="2"><path d="M178 262l6-22l5 2l-5 22z" fill="#e8c45a" /><rect x="172" y="258" width="22" height="6" rx="2" fill="#fff" /></g>
    {:else if avatar.accessory === 'huy-hieu'}
      <g stroke={L} stroke-width="2"><circle cx="128" cy="240" r="7" fill="#e8c45a" /><circle cx="128" cy="240" r="2.8" fill={accent} /></g>
    {/if}
    {#if avatar.effect === 'hat-sang' || avatar.effect === 'trong-dong'}<path d={star(204, 98, 8)} fill="#fff6c8" stroke={L} stroke-width="1.6" />{/if}
  </g>
  {#if avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
    <rect x="20" y="20" width="260" height="360" rx="18" fill="none" stroke="#d9a93a" stroke-width="4" /><rect x="28" y="28" width="244" height="344" rx="14" fill="none" stroke="#d9a93a" stroke-width="1.5" />
  {/if}
  <rect x="14" y="14" width="272" height="372" rx="22" fill="none" stroke={L} stroke-width="2.8" />
</svg>
