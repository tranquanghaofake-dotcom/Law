<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  // Tủ kính trưng bày bộ đồ theo chức danh (thay chân dung người): khung gỗ tối, đèn rọi, biển tên chức danh mạ vàng,
  // bộ đồ treo móc, khung huy hiệu hai bên, bục phụ kiện, giấy khen ghi số sách. Không vẽ quân hàm, cấp hiệu, Quốc huy thật;
  // cầu vai kiểm sát là dải đỏ trơn. `avatar.outfit` là trang phục đã giải theo chức danh.
  import type { Avatar } from '$lib/game/wardrobe';
  import type { EmblemName } from './registry';
  import BookSpine from './BookSpine.svelte';
  import type { BookScheme } from '$lib/ui/shelf';
  import type { BookLevel } from '$lib/game/books';
  import { ring } from './kit';
  type ShelfBook = { key: string; scheme: BookScheme; level: BookLevel; label: string };
  let { avatar, title = 'Công dân', subtitle = '', accent = '#3f9e63', books = [], medals = 0 }:
    { avatar: Avatar; title?: string; subtitle?: string; accent?: string; books?: ShelfBook[]; medals?: number; emblems?: EmblemName[]; scene?: string } = $props();
  const RIB = [['#c0392b', '#e8c45a', '#c0392b'], ['#1f4e9e', '#ffffff', '#1f4e9e'], ['#3f9e63', '#e8c45a', '#3f9e63'], ['#e8c45a', '#c0392b', '#e8c45a'], ['#7a44b8', '#ffffff', '#7a44b8'], ['#c0392b', '#1f4e9e', '#c0392b']];
  const uid = `sh${++seq}`;
  const o = $derived(avatar.outfit);
  const L = '#2a201b';
  const G = $derived(({
    'thuong-phuc': { body: '#efe0c2', dark: '#d8c49f' }, 'cong-so': { body: '#ffffff', dark: '#e3e6ec' },
    'vest-xanh': { body: '#2f4a7a', dark: '#22375c' }, 'vest-den': { body: '#26282e', dark: '#17181c' },
    'ao-choang': { body: '#1d1d22', dark: '#101013' }, 'ks-xuan-he': { body: '#79a8e6', dark: '#5e8fd0' },
    'ks-thu-dong': { body: '#2b3d63', dark: '#1f2d4c' }, 'ao-dai': { body: '#c0392b', dark: '#962a20' },
  } as Record<string, { body: string; dark: string }>)[o] ?? { body: '#efe0c2', dark: '#d8c49f' });
  const jacket = $derived(o === 'vest-xanh' || o === 'vest-den' || o === 'ks-thu-dong');
  const sparks = [[150, 120], [262, 150], [118, 300], [290, 330], [210, 96], [96, 200]];
</script>

<div class="showcase fx-{avatar.effect}">
  <svg class="showcase-svg" viewBox="0 0 400 500" aria-hidden="true" focusable="false" stroke-linecap="round" stroke-linejoin="round">
    <defs>
      <linearGradient id="{uid}-wood" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a2a20" /><stop offset=".5" stop-color="#1f1612" /><stop offset="1" stop-color="#120d0a" /></linearGradient>
      <linearGradient id="{uid}-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9c7a3c" /><stop offset=".5" stop-color="#f3dda0" /><stop offset="1" stop-color="#9c7a3c" /></linearGradient>
      <linearGradient id="{uid}-niche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b4a22" /><stop offset=".35" stop-color="#3a2814" /><stop offset="1" stop-color="#1a120c" /></linearGradient>
      <linearGradient id="{uid}-cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".55" /><stop offset="1" stop-color="#ffe2a0" stop-opacity="0" /></linearGradient>
      <linearGradient id="{uid}-marble" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a3a40" /><stop offset=".5" stop-color="#1e1e22" /><stop offset="1" stop-color="#2c2c32" /></linearGradient>
      <linearGradient id="{uid}-fold" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18" /><stop offset=".35" stop-color="#fff" stop-opacity=".08" /><stop offset=".65" stop-color="#000" stop-opacity="0" /><stop offset="1" stop-color="#000" stop-opacity=".22" /></linearGradient>
      <filter id="{uid}-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
    </defs>
    <!-- khung gỗ + vách trong -->
    <rect width="400" height="500" rx="14" fill="url(#{uid}-wood)" />
    <rect x="22" y="22" width="356" height="456" rx="4" fill="#141416" />
    <path d="M70 22v456M330 22v456" stroke="#26262b" stroke-width="2" />
    <rect x="22" y="22" width="356" height="456" rx="4" fill="none" stroke="url(#{uid}-gold)" stroke-width="1.5" opacity=".6" />
    <!-- hốc giữa có đèn hắt -->
    <rect x="62" y="98" width="276" height="350" rx="4" fill="url(#{uid}-niche)" />
    <rect x="62" y="98" width="276" height="350" rx="4" fill="none" stroke="#f5c76a" stroke-width="3" opacity=".5" filter="url(#{uid}-glow)" />
    <rect x="62" y="98" width="276" height="350" rx="4" fill="none" stroke="url(#{uid}-gold)" stroke-width="1.6" />
    {#if avatar.effect === 'trong-dong' || avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
      <g class="sun-spin" opacity=".35"><path d={ring(200, 250, 62, 74, 40)} fill="#c99a4a" /><circle cx="200" cy="250" r="56" fill="none" stroke="#c99a4a" stroke-width="2" stroke-dasharray="2 6" /></g>
    {/if}
    <!-- đèn rọi trần -->
    <rect x="188" y="98" width="24" height="12" rx="2" fill="#8f8f96" stroke={L} stroke-width="1.5" />
    <rect x="191" y="108" width="18" height="7" rx="2" fill="#c8c8cc" stroke={L} stroke-width="1.5" />
    <path d="M192 114L66 446h268L208 114z" fill="url(#{uid}-cone)" opacity={avatar.effect === 'khong' ? 0.45 : 0.85} />
    <circle cx="200" cy="116" r="4" fill="#fff4cc" filter="url(#{uid}-glow)" />
    <!-- biển tên -->
    <rect x="78" y="24" width="244" height="68" rx="3" fill="#0c0c0e" stroke="url(#{uid}-gold)" stroke-width="2.5" />
    <rect x="84" y="30" width="232" height="56" rx="2" fill="none" stroke="url(#{uid}-gold)" stroke-width=".8" opacity=".7" />
    <!-- móc + bộ đồ (phóng to 1,2 lần quanh hốc giữa) -->
    <g transform="translate(-24 -66) scale(1.12)">
    <path d="M200 160q8 0 8 7q0 6-8 9" fill="none" stroke="#c8c8cc" stroke-width="3" />
    <path d="M200 176l-58 22h116z" fill="#8a5a3a" stroke={L} stroke-width="2" />
    <g stroke={L} stroke-width="2.2">
      {#if o === 'ao-choang'}
        <path d="M160 190q-30 20-36 214h152q-6-194-36-214l-14 10h-52z" fill={G.body} />
        <path d="M160 190q-34 18-46 120h26q4-60 22-104z" fill={G.dark} /><path d="M240 190q34 18 46 120h-26q-4-60-22-104z" fill={G.dark} />
        <path d="M200 206v196" fill="none" stroke="#3a3a42" stroke-width="2" />
        <path d="M180 194l20 18l20-18l-4 14h-32z" fill="#fff" /><path d="M196 206h8l2 6l-3 22l-3 4l-3-4l-3-22z" fill="#6e1f1f" stroke-width="1.6" />
      {:else if o === 'ao-dai'}
        <path d="M168 192q-24 40-24 212h112q0-172-24-212l-12 6h-40z" fill={G.body} />
        <path d="M168 192q-30 20-40 108h22q4-50 22-90zM232 192q30 20 40 108h-22q-4-50-22-90z" fill={G.dark} />
        <path d="M180 188h40v14q-20 6-40 0z" fill="#e8c45a" />
        <path d="M156 300q22-9 44 0t44 0M152 340q24-9 48 0t48 0M150 380q25-9 50 0t50 0" fill="none" stroke="#e8c45a" stroke-width="2.4" />
      {:else}
        <path d="M160 192q-18 6-26 20l-8 { o === 'ks-xuan-he' ? 40 : 150 }h22l10-{ o === 'ks-xuan-he' ? 30 : 118 }v{ o === 'ks-xuan-he' ? 150 : 152 }h84v-{ o === 'ks-xuan-he' ? 150 : 152 }l10 { o === 'ks-xuan-he' ? 30 : 118 }h22l-8-{ o === 'ks-xuan-he' ? 40 : 150 }q-8-14-26-20l-14 8h-52z" fill={G.body} />
        <path d="M158 212v154h84V212" fill="url(#{uid}-fold)" stroke="none" />
      {/if}
      <!-- chi tiết theo trang phục -->
      {#if o === 'thuong-phuc'}
        <path d="M180 194q20 14 40 0" fill="none" /><path d="M158 352h84M126 356h22M252 356h22" fill="none" stroke-width="3" opacity=".5" />
      {:else if o === 'cong-so'}
        <path d="M178 192l22 22l22-22l-4 18l-18-6l-18 6z" fill="#fff" />
        <path d="M200 214v150" fill="none" stroke-width="1.4" /><g fill={L} stroke="none">{#each [236, 262, 288, 314, 340] as y (y)}<circle cx="200" cy={y} r="2" />{/each}</g>
        <rect x="214" y="234" width="20" height="22" fill="none" stroke-width="1.6" />
        <path d="M184 196l16 56l16-56" fill="none" stroke={accent} stroke-width="3" />
        <rect x="188" y="250" width="24" height="30" rx="3" fill="#fff" stroke-width="1.8" /><rect x="188" y="250" width="24" height="8" rx="2" fill={accent} stroke-width="1.8" />
      {:else if jacket}
        <path d="M178 192l22 30l22-30z" fill={o === 'vest-xanh' ? '#dbe8fb' : '#fff'} />
        <path d="M195 202h10l3 8l-5 50l-3 6l-3-6l-5-50z" fill={o === 'vest-den' ? '#c0392b' : o === 'ks-thu-dong' ? '#25324f' : '#8a2b2b'} stroke-width="1.6" />
        <path d="M178 192l20 50l-28-14l-8-34zM222 192l-20 50l28-14l8-34z" fill={G.dark} stroke-width="2" />
        <path d="M200 242v124" fill="none" stroke-width="1.4" /><g fill={L} stroke="none"><circle cx="200" cy="282" r="2.6" /><circle cx="200" cy="308" r="2.6" /></g>
        <path d="M222 252h18" stroke-width="2.4" /><path d="M224 252l4-6l4 6" fill="#fff" stroke-width="1.2" />
        {#if o === 'vest-den'}<circle cx="176" cy="238" r="5" fill="#e8c45a" stroke-width="1.6" />{/if}
      {:else if o === 'ks-xuan-he'}
        <path d="M178 192l22 20l22-20l-4 18l-18-6l-18 6z" fill={G.body} />
        <path d="M200 212v152" fill="none" stroke-width="1.4" /><g fill={L} stroke="none">{#each [240, 268, 296, 324] as y (y)}<circle cx="200" cy={y} r="2" />{/each}</g>
        <rect x="164" y="232" width="26" height="24" rx="2" fill={G.body} stroke-width="1.6" /><rect x="210" y="232" width="26" height="24" rx="2" fill={G.body} stroke-width="1.6" />
        <rect x="212" y="222" width="24" height="7" rx="1.5" fill="#25324f" stroke-width="1.4" />
      {/if}
      {#if avatar.accessory === 'huy-hieu'}<circle cx="178" cy="240" r="6" fill="#e8c45a" stroke-width="1.6" /><circle cx="178" cy="240" r="2.4" fill={accent} stroke="none" />{/if}
      {#if avatar.accessory === 'but'}<path d="M226 236l3-18l4 1l-3 18z" fill="#e8c45a" stroke-width="1.4" />{/if}
      <!-- cầu vai to (kiểm sát: nền đỏ, viền chỉ vàng, không sao/biểu tượng) -->
      {#if o === 'ks-xuan-he' || o === 'ks-thu-dong'}
        <g fill="#c0392b" stroke="#e8c45a" stroke-width="1.6"><path d="M132 200l36-9l6 10l-3 7l-36 8z" /><path d="M268 200l-36-9l-6 10l3 7l36 8z" /></g>
        <g fill="#e8c45a" stroke={L} stroke-width=".8"><circle cx="170" cy="200" r="2.4" /><circle cx="230" cy="200" r="2.4" /></g>
      {/if}
      <!-- huân chương: dải ruy băng + huy chương tròn (mẫu chung, không theo huân chương thật) -->
      {#if medals > 0 && o !== 'thuong-phuc'}
        {#each RIB.slice(0, Math.min(medals, 6)) as r, k (k)}
          {@const bx = 160 + (k % 3) * 9}
          {@const by = 226 + Math.floor(k / 3) * 5}
          <g stroke={L} stroke-width=".6"><rect x={bx} y={by} width="3" height="4" fill={r[0]} /><rect x={bx + 3} y={by} width="3" height="4" fill={r[1]} /><rect x={bx + 6} y={by} width="3" height="4" fill={r[2]} /></g>
        {/each}
        {#if medals >= 3}
          {#each [0, 1].slice(0, medals >= 5 ? 2 : 1) as k (k)}
            <g stroke={L} stroke-width="1"><path d="M{163 + k * 12} 238h8l-1 9h-6z" fill={RIB[k][0]} /><circle cx={167 + k * 12} cy="252" r="5.5" fill="#e8c45a" /><circle cx={167 + k * 12} cy="252" r="2.4" fill="#c99a4a" stroke="none" /></g>
          {/each}
        {/if}
      {/if}
    </g>
    </g>
    <!-- kệ kính trưng sách: mặt kính + cạnh gỗ, phụ kiện ở hai đầu kệ -->
    <rect x="30" y="448" width="340" height="6" fill="#e9eef2" opacity=".35" stroke="url(#{uid}-gold)" stroke-width="1" />
    <rect x="30" y="454" width="340" height="24" fill="url(#{uid}-marble)" stroke={L} stroke-width="1.5" />
    <path d="M30 460h340" stroke="url(#{uid}-gold)" stroke-width="1" opacity=".6" />
    <g stroke={L} stroke-width="1.8">
      {#if avatar.accessory === 'kinh'}
        <g fill="none" stroke="#e8c45a" stroke-width="2.4"><circle cx="46" cy="440" r="8" /><circle cx="70" cy="440" r="8" /><path d="M54 439h8M38 436l-6-4M78 436l6-4" /></g>
      {:else if avatar.accessory === 'cap'}
        <rect x="34" y="420" width="50" height="28" rx="4" fill="#9a6b3f" /><path d="M49 420v-6h20v6M34 432h50" fill="none" /><rect x="54" y="428" width="10" height="8" rx="1.5" fill="#e8c45a" />
      {/if}
      <path d="M352 404v44M332 412h40M332 412l-8 15h16zM372 412l-8 15h16zM342 448h20" fill="none" stroke="#e8c45a" stroke-width="2.4" /><circle cx="352" cy="402" r="3" fill="#e8c45a" />
    </g>
    {#if avatar.effect === 'hat-sang'}<g fill="#fff6c8">{#each sparks as [x, y], i (i)}<circle class="spark" cx={x} cy={y} r="2.2" style="animation-delay:{i * 0.4}s" />{/each}</g>{/if}
    {#if avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}<rect x="6" y="6" width="388" height="488" rx="12" fill="none" stroke="url(#{uid}-gold)" stroke-width="5" />{/if}
  </svg>
  <!-- chữ và huy hiệu đặt bằng HTML để tự xuống dòng, co chữ -->
  <p class="sc-plaque" style="--len:{title.length}">{title}</p>
  {#if subtitle}<p class="sc-sub">{subtitle}</p>{/if}
  <ul class="sc-books" aria-hidden="true">
    {#each books as b (b.key)}<li><BookSpine scheme={b.scheme} level={b.level} label={b.label} w={22} h={74} /></li>{/each}
    {#each Array(Math.max(0, 6 - books.length)) as _, i (i)}<li class="ghost"><span></span></li>{/each}
  </ul>
  <span class="sc-glass" aria-hidden="true"></span>
</div>
