<!-- Sách luật bìa cứng: khung kép, mặt trống đồng, tiêu đề in hoa (cảm hứng bìa sách luật in trong nước — cách điệu, không dùng Quốc huy). -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  const rays = Array.from({ length: 12 }, (_, i) => (i * Math.PI) / 6);
</script>

<Clouds cy={92} />
<!-- chồng sách nằm bên trái -->
<g>
  <rect class="f-ink s-line" x="44" y="168" width="84" height="16" rx="2" />
  <rect class="f-card s-line s-thin" x="124" y="170" width="6" height="12" />
  <path class="s-line s-thin s-paper" d="M52 172v8M58 172v8" />
  <rect class="f-acc s-line" x="52" y="152" width="74" height="16" rx="2" />
  <path class="s-line s-thin" d="M60 156v8M66 156v8M80 160h30" />
  <rect class="f-seal s-line" x="58" y="138" width="64" height="14" rx="2" />
  <path class="s-line s-thin s-paper" d="M66 141v8M72 141v8M84 145h26" />
</g>
<!-- cuốn đứng, quay bìa -->
<rect class="f-void" x="138" y="40" width="8" height="146" rx="2" />
<rect class="f-cover s-line" x="144" y="40" width="96" height="146" rx="3" />
<rect class="s-goldline" x="152" y="48" width="80" height="130" />
<rect class="s-goldline s-thin" x="156" y="52" width="72" height="122" />
<!-- mặt trống đồng thay Quốc huy -->
<circle class="f-acc s-line s-thin" cx="192" cy="80" r="15" />
<circle class="s-line s-thin" cx="192" cy="80" r="11" />
<g class="s-line s-thin">{#each rays as a (a)}<path d="M{192 + Math.cos(a) * 3} {80 + Math.sin(a) * 3}L{192 + Math.cos(a) * 9} {80 + Math.sin(a) * 9}" />{/each}</g>
<!-- tiêu đề -->
<text class="f-gold art-title" x="192" y="122" text-anchor="middle">LUẬT</text>
<g class="s-goldline s-thin"><path d="M166 132h52M172 140h40M180 158h24" /></g>
<rect class="s-goldline s-thin" x="186" y="162" width="12" height="8" />
<!-- sách mở + cán cân bên phải -->
<path class="f-card s-line" d="M244 184q16-8 30 0q14-8 30 0v-26q-16-8-30 0q-14-8-30 0z" />
<path class="s-line s-thin" d="M274 158v26M250 166h18M250 172h18M280 166h18M280 172h18" />
<g class="s-line s-thin"><path d="M274 154v-38M260 120h28M260 120l-5 10M260 120l5 10M288 120l-5 10M288 120l5 10M268 154h12" /></g>
<g class="f-acc s-line s-thin"><path d="M254 130h12a6 3 0 0 1-12 0zM282 130h12a6 3 0 0 1-12 0z" /></g>
