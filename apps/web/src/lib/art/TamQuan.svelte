<!-- Cổng tam quan: ba lối, mái giữa cao — hình mặc định cho môn chưa có hình riêng. -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
</script>

<Clouds />
<!-- hai cổng bên -->
<rect class="f-card s-line" x="70" y="128" width="50" height="58" />
<rect class="f-card s-line" x="200" y="128" width="50" height="58" />
<g class="f-void">
  <path d="M84 186v-30a11 11 0 0 1 22 0v30z" />
  <path d="M214 186v-30a11 11 0 0 1 22 0v30z" />
</g>
<path class="f-seal s-line" d="M58 118q8 10 18 10h40v-12h-36q-12 6-22 2z" />
<path class="f-seal s-line" d="M262 118q-8 10-18 10h-40v-12h36q12 6 22 2z" />
<!-- cổng giữa -->
<rect class="f-card s-line" x="120" y="96" width="80" height="90" />
<path class="f-void" d="M140 186v-46a20 20 0 0 1 40 0v46z" />
<rect class="f-acc s-line s-thin" x="142" y="104" width="36" height="12" />
<path class="f-seal s-line" d="M100 82q10 14 24 14h72q14 0 24-14q-18 6-38-2h-44q-20 8-38 2z" />
<path class="s-line s-bold" d="M138 80h44" />
<path class="f-seal s-line" d="M116 60q8 10 18 10h52q10 0 18-10q-14 4-30-2h-28q-16 6-30 2z" />
<path class="s-line s-bold" d="M146 58h28" />
<circle class="f-acc s-line" cx="160" cy="50" r="5" />
<path class="s-line s-thin" d="M120 80v16M200 80v16" />
