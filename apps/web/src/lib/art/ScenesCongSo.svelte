<!-- Phông nơi làm việc cho tủ trưng bày (đợt 10): trụ sở UBND cấp xã, trụ sở cơ quan cấp tỉnh, trụ sở bộ/Chính phủ,
     trụ sở Viện kiểm sát, dinh thự nguyên thủ có vườn và ao sen. Khung 520×325, mặt đất y=301, khối phẳng + nét mảnh như các cảnh khác.
     Cách điệu kiểu kiến trúc công sở Việt Nam (tường vàng mái ngói, tân cổ điển, khối hiện đại), KHÔNG phải công trình cụ thể;
     biển tên để trống; không cờ, Quốc huy, phù hiệu ngành, logo. Nạp lười qua ScenesMore.svelte. -->
<script lang="ts">
  import type { ArtName } from './registry';
  import Clouds from './Clouds.svelte';
  import Tree from './parts/Tree.svelte';
  import Pad from './parts/Pad.svelte';
  import Lotus from './parts/Lotus.svelte';
  import { tiles, balustrade, ripples } from './kit';
  let { name }: { name: ArtName } = $props();
  const row = (n: number, x0: number, dx: number) => Array.from({ length: n }, (_, i) => x0 + i * dx);
  /** lưới cửa sổ chữ nhật: mỗi ô là một cửa có song dọc */
  const panes = (x0: number, y0: number, nx: number, ny: number, dx: number, dy: number, w: number, h: number) =>
    row(ny, y0, dy).flatMap((y) => row(nx, x0, dx).map((x) => ({ x, y, w, h })));
</script>

{#if name === 'tru-so-xa'}
  <!-- trụ sở UBND cấp xã: nhà hai tầng tường vàng, mái ngói đỏ bốn mái, sảnh giữa hai cột, biển tên trống, sân gạch, cây bàng, hàng rào thấp -->
  <Clouds cy={118} r={98} puffs={false} />
  <Tree x={52} y={301} s={1.2} /><Tree x={470} y={301} s={1.05} />
  <rect class="f-ochre k" x="110" y="176" width="300" height="114" stroke-width="1.8" />
  <rect class="f-ochre2" x="380" y="176" width="30" height="114" />
  <path class="f-seal2 k" d="M98 178l36-34h252l36 34z" stroke-width="1.8" /><path class="ks" d={tiles(130, 390, 146, 177, 7, 0.08)} stroke-width="1" opacity=".75" />
  <path class="k" d="M110 232h300" stroke-width="2.4" />
  {#each panes(124, 188, 6, 2, 48, 54, 22, 32) as w (w.x + '-' + w.y)}
    {#if !(w.x > 220 && w.x < 300)}
      <rect class="f-void k" x={w.x} y={w.y} width={w.w} height={w.h} stroke-width="1.3" /><path class="kp" d="M{w.x + 11} {w.y}v{w.h}M{w.x} {w.y + 12}h{w.w}" stroke-width=".8" />
      <rect class="f-cream k" x={w.x - 2} y={w.y + w.h} width={w.w + 4} height="3" stroke-width=".9" />
    {/if}
  {/each}
  <!-- sảnh giữa nhô ra: mái bằng có lan can, hai cột, biển tên đỏ trống -->
  <rect class="f-cream k" x="216" y="196" width="88" height="94" stroke-width="1.6" />
  <rect class="f-seal k" x="226" y="200" width="68" height="16" rx="2" stroke-width="1.3" /><path class="kp" d="M236 208h48" stroke-width="1.6" opacity=".8" />
  <path class="k" d={balustrade(212, 186, 96, 10, 8)} stroke-width="1" />
  {#each [228, 292] as x (x)}<rect class="f-card k" x={x - 5} y="220" width="10" height="70" stroke-width="1.3" />{/each}
  <rect class="f-acc2 k" x="246" y="244" width="28" height="46" stroke-width="1.4" /><path class="ka" d="M260 244v46" stroke-width="1" />
  <rect class="f-card k" x="206" y="290" width="108" height="5" stroke-width="1.3" /><rect class="f-card k" x="196" y="295" width="128" height="6" stroke-width="1.3" />
  <!-- hàng rào thấp, cổng mở -->
  <path class="k" d="M20 286h150M350 286h150" stroke-width="1.6" /><path class="k" d={balustrade(20, 286, 150, 15, 10) + balustrade(350, 286, 150, 15, 10)} stroke-width="1" />
{:else if name === 'tru-so-tinh'}
  <!-- trụ sở cơ quan cấp tỉnh: khối nhiều tầng hiện đại, khối giữa cao có sảnh cột, lưới cửa kính, quảng trường, bồn hoa -->
  <Clouds cy={104} r={96} puffs={false} />
  <Tree x={40} y={301} s={1} /><Tree x={484} y={301} s={0.95} />
  <!-- hai cánh -->
  {#each [[70, 150], [300, 150]] as [x, w] (x)}
    <rect class="f-cream k" x={x} y="168" width={w} height="122" stroke-width="1.7" />
    {#each panes(x + 10, 178, 6, 4, 23, 27, 15, 18) as p (p.x + '-' + p.y)}<rect class="f-water k" x={p.x} y={p.y} width={p.w} height={p.h} stroke-width="1" opacity=".9" />{/each}
    <rect class="f-shade" x={x + w - 18} y="168" width="18" height="122" opacity=".7" />
  {/each}
  <!-- khối giữa cao -->
  <rect class="f-card k" x="210" y="110" width="100" height="180" stroke-width="1.9" />
  <rect class="f-shade" x="290" y="110" width="20" height="180" />
  <rect class="f-seal2 k" x="204" y="102" width="112" height="10" stroke-width="1.5" />
  {#each panes(222, 122, 4, 4, 20, 26, 12, 18) as p (p.x + '-' + p.y)}<rect class="f-water k" x={p.x} y={p.y} width={p.w} height={p.h} stroke-width="1" />{/each}
  <rect class="f-seal k" x="226" y="226" width="68" height="12" rx="2" stroke-width="1.2" /><path class="kp" d="M236 232h48" stroke-width="1.4" opacity=".8" />
  {#each row(4, 222, 25.3) as x (x)}<rect class="f-card k" x={x - 4} y="240" width="8" height="50" stroke-width="1.2" />{/each}
  <rect class="f-void" x="236" y="252" width="48" height="38" opacity=".85" />
  <rect class="f-card k" x="190" y="290" width="140" height="5" stroke-width="1.3" /><rect class="f-card k" x="176" y="295" width="168" height="6" stroke-width="1.3" />
  <!-- bồn hoa hai bên bậc -->
  {#each [120, 400] as x (x)}<ellipse class="f-leaf k" cx={x} cy="296" rx="34" ry="6" stroke-width="1.1" /><path class="ka" d="M{x - 20} 293l3-4M{x - 6} 292l2-5M{x + 8} 293l3-4M{x + 20} 293l2-4" stroke-width="1.6" />{/each}
{:else if name === 'tru-so-bo'}
  <!-- trụ sở bộ/Chính phủ: nhà ba tầng tường vàng kiểu Pháp, mái dốc đen, lầu giữa có đồng hồ, cửa vòm tầng trệt, hàng cây cổ thụ -->
  <Clouds cy={120} r={104} puffs={false} />
  <Tree x={34} y={301} s={1.25} /><Tree x={488} y={301} s={1.2} />
  <rect class="f-ochre k" x="64" y="172" width="392" height="118" stroke-width="1.8" />
  <rect class="f-ochre2" x="426" y="172" width="30" height="118" />
  <path class="f-ink k" d="M56 174l18-22h372l18 22z" stroke-width="1.6" opacity=".85" />
  {#each row(5, 98, 30) as x (x)}<rect class="f-cream k" x={x - 6} y="156" width="12" height="12" stroke-width="1" />{/each}
  {#each row(5, 342, 30) as x (x)}<rect class="f-cream k" x={x - 6} y="156" width="12" height="12" stroke-width="1" />{/each}
  <path class="k" d="M64 214h392M64 252h392" stroke-width="1.4" />
  {#each [...row(5, 80, 30), ...row(5, 324, 30)] as x (x)}
    <rect class="f-void k" x={x} y="180" width="16" height="26" stroke-width="1.2" /><path class="kp" d="M{x + 8} 180v26" stroke-width=".8" />
    <rect class="f-void k" x={x} y="220" width="16" height="26" stroke-width="1.2" /><path class="kp" d="M{x + 8} 220v26" stroke-width=".8" />
    <path class="f-void k" d="M{x} 290v-24a8 8 0 0 1 16 0v24z" stroke-width="1.2" />
  {/each}
  <!-- lầu giữa: trán tường, mặt đồng hồ, mái chóp -->
  <rect class="f-cream k" x="222" y="132" width="76" height="158" stroke-width="1.8" />
  <path class="f-ink k" d="M216 134l44-40l44 40z" stroke-width="1.6" opacity=".9" />
  <circle class="f-card k" cx="260" cy="118" r="12" stroke-width="1.4" /><path class="k" d="M260 118v-8M260 118l6 3" stroke-width="1.3" />
  <path class="k" d="M260 94v-10" stroke-width="1.6" />
  <rect class="f-seal k" x="232" y="146" width="56" height="12" rx="2" stroke-width="1.2" /><path class="kp" d="M240 152h40" stroke-width="1.4" opacity=".8" />
  {#each [236, 252, 268, 284] as x (x)}<rect class="f-card k" x={x - 3.5} y="196" width="7" height="94" stroke-width="1.1" />{/each}
  <path class="f-void k" d="M246 290v-36a14 14 0 0 1 28 0v36z" stroke-width="1.4" />
  <rect class="f-card k" x="204" y="290" width="112" height="5" stroke-width="1.3" /><rect class="f-card k" x="190" y="295" width="140" height="6" stroke-width="1.3" />
{:else if name === 'vien-kiem-sat'}
  <!-- trụ sở Viện kiểm sát: khối đá xám xanh tân cổ điển, sảnh bốn cột cao, mặt tròn trống trên trán tường (không phù hiệu), bậc rộng -->
  <Clouds cy={126} r={106} puffs={false} />
  <Tree x={44} y={301} s={1.05} /><Tree x={478} y={301} s={1.1} />
  <rect class="f-stone k" x="80" y="160" width="360" height="130" stroke-width="1.8" />
  <rect class="f-stone2" x="410" y="160" width="30" height="130" />
  <rect class="f-ksu k" x="72" y="150" width="376" height="12" stroke-width="1.5" />
  {#each [...row(4, 96, 30), ...row(4, 334, 30)] as x (x)}
    {#each [176, 228] as y (y)}<rect class="f-void k" x={x} y={y} width="18" height="34" stroke-width="1.2" /><path class="kp" d="M{x + 9} {y}v34M{x} {y + 14}h18" stroke-width=".8" />{/each}
  {/each}
  <!-- sảnh giữa -->
  <path class="f-stone k" d="M194 150l66-46l66 46z" stroke-width="1.8" />
  <circle class="f-gold k" cx="260" cy="132" r="11" stroke-width="1.3" /><circle class="k" cx="260" cy="132" r="7" fill="none" stroke-width="1" />
  <rect class="f-stone k" x="198" y="150" width="124" height="140" stroke-width="1.6" />
  {#each row(4, 212, 32) as x (x)}
    <rect class="f-card k" x={x - 6} y="166" width="12" height="118" stroke-width="1.4" /><path class="kw" d="M{x - 2} 170v110M{x + 2} 170v110" stroke-width=".8" />
    <rect class="f-cream k" x={x - 9} y="160" width="18" height="6" stroke-width="1.1" />
  {/each}
  <rect class="f-ksu2 k" x="244" y="236" width="32" height="54" stroke-width="1.4" /><path class="kp" d="M260 236v54" stroke-width="1" />
  <rect class="f-ksu k" x="222" y="158" width="76" height="4" stroke-width=".8" />
  <rect class="f-card k" x="180" y="290" width="160" height="5" stroke-width="1.3" /><rect class="f-card k" x="164" y="295" width="192" height="6" stroke-width="1.3" />
{:else if name === 'phu-chu-tich'}
  <!-- dinh thự nguyên thủ: lâu đài tường vàng hai tầng, lầu giữa trán tường tam giác, hai cánh có hiên, vườn xoài và ao sen phía trước -->
  <Clouds cy={110} r={100} puffs={false} />
  <Tree x={30} y={262} s={1.15} /><Tree x={96} y={262} s={0.9} /><Tree x={428} y={262} s={0.95} /><Tree x={492} y={262} s={1.2} />
  <rect class="f-ochre k" x="110" y="164" width="300" height="98" stroke-width="1.8" />
  <rect class="f-ochre2" x="380" y="164" width="30" height="98" />
  <path class="f-seal2 k" d="M100 166l16-18h288l16 18z" stroke-width="1.6" />
  <path class="k" d="M110 212h300" stroke-width="1.6" />
  {#each [...row(4, 124, 22), ...row(4, 330, 22)] as x (x)}
    <path class="f-void k" d="M{x} 204v-24a7 7 0 0 1 14 0v24z" stroke-width="1.1" />
    <path class="f-void k" d="M{x} 256v-26a7 7 0 0 1 14 0v26z" stroke-width="1.1" />
  {/each}
  <rect class="f-cream k" x="222" y="126" width="76" height="136" stroke-width="1.8" />
  <path class="f-cream k" d="M214 128l46-30l46 30z" stroke-width="1.7" /><path class="k" d="M228 124l32-21l32 21" stroke-width="1" />
  <path class="k" d={balustrade(222, 196, 76, 10, 8)} stroke-width="1" />
  {#each [234, 252, 268, 286] as x (x)}<rect class="f-card k" x={x - 3.5} y="206" width="7" height="56" stroke-width="1.1" />{/each}
  <path class="f-void k" d="M248 262v-30a12 12 0 0 1 24 0v30z" stroke-width="1.3" />
  <rect class="f-card k" x="206" y="262" width="108" height="5" stroke-width="1.3" />
  <!-- ao sen -->
  <path class="f-water k" d="M40 276q220-12 440 0v25H40z" stroke-width="1.4" />
  <path class="kw" d={ripples(50, 284, 420, 2, 7)} stroke-width="1" />
  <Pad x={110} y={288} r={16} /><Pad x={176} y={292} r={12} /><Pad x={350} y={290} r={15} /><Pad x={414} y={286} r={12} />
  <Lotus x={118} y={282} s={0.8} /><Lotus x={356} y={284} s={0.75} />
{/if}
