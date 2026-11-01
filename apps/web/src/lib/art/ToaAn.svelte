<!-- Toà nhà xét xử kiểu tân cổ điển, cán cân trên trán tường (cách điệu, không phải công trình cụ thể). -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  const cols = [116, 132, 148, 172, 188, 204];
  const wins = [62, 84, 226, 248];
</script>

<Clouds cy={92} />
<!-- cánh hai bên -->
<rect class="f-card s-line" x="50" y="108" width="62" height="64" />
<rect class="f-card s-line" x="208" y="108" width="62" height="64" />
<rect class="f-seal s-line" x="46" y="100" width="70" height="8" />
<rect class="f-seal s-line" x="204" y="100" width="70" height="8" />
<g class="f-void">{#each wins as x (x)}<path d="M{x} 160v-30a5 5 0 0 1 10 0v30z" />{/each}</g>
<g class="s-line s-thin">{#each wins as x (x)}<path d="M{x} 142h10M{x + 5} 126v34" />{/each}</g>
<!-- khối giữa -->
<rect class="f-void" x="108" y="104" width="104" height="68" />
<path class="f-acc s-line" d="M106 98h108v6H106z" />
<path class="f-card s-line" d="M102 98l58-34l58 34z" />
<path class="s-line s-thin" d="M116 92l44-24l44 24z" />
<!-- cán cân trên trán tường -->
<g class="s-line s-thin">
  <path d="M160 70v18M150 88h20M146 75h28M146 75l-5 8M146 75l5 8M174 75l-5 8M174 75l5 8" />
</g>
<g class="f-acc s-line s-thin"><path d="M140 83h12a6 3 0 0 1-12 0zM168 83h12a6 3 0 0 1-12 0z" /></g>
<circle class="f-acc s-line s-thin" cx="160" cy="70" r="2.5" />
<!-- hàng cột -->
<g class="f-card s-line s-thin">{#each cols as x (x)}<rect x={x - 4} y="104" width="8" height="68" />{/each}</g>
<g class="f-card s-line s-thin">{#each cols as x (x)}<rect x={x - 6} y="104" width="12" height="4" /><rect x={x - 6} y="168" width="12" height="4" />{/each}</g>
<path class="f-seal" d="M154 172v-30a6 6 0 0 1 12 0v30z" />
<!-- bậc -->
<rect class="f-card s-line" x="96" y="172" width="128" height="6" />
<rect class="f-card s-line" x="84" y="178" width="152" height="8" />
<!-- cây hai bên -->
<g class="f-leaf s-line s-thin">
  <path d="M28 186v-4q-12-2-10-14q-6-12 6-18q2-12 14-10q12-2 14 10q12 6 6 18q2 12-10 14v4z" />
  <path d="M292 186v-4q12-2 10-14q6-12-6-18q-2-12-14-10q-12-2-14 10q-12 6-6 18q-2 12 10 14v4z" />
</g>
<path class="s-line s-thin" d="M38 186v-30M282 186v-30M38 168l-6-6M282 168l6-6" />
