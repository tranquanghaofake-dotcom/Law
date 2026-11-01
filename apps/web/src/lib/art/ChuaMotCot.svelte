<!-- Chùa trên một cột giữa hồ sen (cảm hứng Chùa Một Cột — cách điệu). -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  const pads = [[58, 168, 16], [96, 184, 13], [226, 182, 15], [262, 166, 12], [124, 166, 9], [204, 168, 10]];
  const flowers = [[70, 160], [238, 172], [112, 176]];
</script>

<Clouds ground={false} cy={90} />
<!-- hồ -->
<path class="f-water" d="M20 150q140-14 280 0v50H20z" />
<g class="s-water s-line s-thin"><path d="M40 162h30M150 178h40M250 192h30M90 194h26M200 158h24" /></g>
<!-- cột đá và phản chiếu -->
<rect class="f-card s-line" x="153" y="122" width="14" height="50" />
<path class="s-line s-thin" d="M153 134h14M153 146h14M153 158h14" />
<path class="s-water s-line" d="M156 176v10M164 178v14" />
<!-- giá đỡ -->
<path class="s-line" d="M160 132l-38-12M160 132l38-12M160 126l-26-6M160 126l26-6" />
<rect class="f-seal s-line" x="112" y="114" width="96" height="8" />
<path class="s-line s-thin" d="M112 118h96" />
<!-- điện thờ -->
<rect class="f-seal s-line" x="124" y="90" width="72" height="24" />
<g class="f-void"><rect x="132" y="96" width="14" height="18" /><rect x="153" y="94" width="14" height="20" /><rect x="174" y="96" width="14" height="18" /></g>
<g class="s-line s-thin s-paper"><path d="M139 96v18M160 94v20M181 96v18" /></g>
<!-- lan can quanh điện -->
<path class="s-line s-thin" d="M114 112h92M118 112v-6h84v6M126 106v6M138 106v6M182 106v6M194 106v6" />
<!-- mái -->
<path class="f-seal s-line" d="M98 74q10 16 26 16h72q16 0 26-16q-18 6-40-2h-44q-22 8-40 2z" />
<path class="s-line s-thin s-paper" d="M120 82h80M128 76l-2 12M144 74v14M160 74v14M176 74v14M192 76l2 12" />
<path class="s-line s-bold" d="M138 72h44" />
<!-- lưỡng long chầu nguyệt cách điệu -->
<path class="s-line" d="M140 72q-4-10 6-12q6 0 8 6M180 72q4-10-6-12q-6 0-8 6" />
<circle class="f-acc s-line" cx="160" cy="62" r="5" />
<!-- bậc lên chùa -->
<path class="f-card s-line" d="M58 150h14v-6h12v-6h12v-6h12v-6h12v-6h6v6h-6v6h-12v6h-12v6h-12v6h-12v6H58z" />
<!-- sen: lá + hoa -->
<g class="f-leaf s-line s-thin">
  {#each pads as [x, y, rr] (x)}<path d="M{x} {y}m-{rr} 0a{rr} {rr * 0.4} 0 1 0 {rr * 2} 0a{rr} {rr * 0.4} 0 1 0-{rr * 2} 0zM{x} {y}l{rr * 0.7} -{rr * 0.25}" />{/each}
</g>
<g class="f-lotus s-line s-thin">
  {#each flowers as [x, y] (x)}
    <path d="M{x} {y}q-9-4-7-14q5 4 7 10q2-6 7-10q2 10-7 14z" />
    <path d="M{x} {y}q-3-8 0-16q3 8 0 16z" />
  {/each}
</g>
