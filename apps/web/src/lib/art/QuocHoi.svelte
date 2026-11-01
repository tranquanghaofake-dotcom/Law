<!-- Toà nhà nghị viện cách điệu: bệ bậc, hàng cột, khối trụ tròn ở giữa (cảm hứng Nhà Quốc hội — không phải bản vẽ kiến trúc). -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  const cols = Array.from({ length: 11 }, (_, i) => 74 + i * 16.6);
</script>

<Clouds />
<!-- khối trụ tròn trên mái -->
<rect class="f-card s-line" x="118" y="52" width="84" height="30" />
<path class="s-line s-thin" d="M130 52v30M146 52v30M160 52v30M174 52v30M190 52v30" />
<ellipse class="f-acc s-line" cx="160" cy="52" rx="42" ry="6" />
<!-- mái bằng vươn ra, diềm -->
<rect class="f-ink" x="52" y="82" width="216" height="9" />
<rect class="f-seal s-line" x="62" y="91" width="196" height="8" />
<path class="s-line s-thin s-paper" d="M70 95h180" />
<!-- tường kính phía sau + hàng cột -->
<rect class="f-void" x="66" y="99" width="188" height="61" />
<g class="s-line s-thin s-paper"><path d="M66 120h188M66 140h188" /></g>
<g class="f-card s-line s-thin">
  {#each cols as x (x)}<rect x={x - 3} y="99" width="6" height="61" />{/each}
</g>
<!-- bệ và bậc -->
<rect class="f-card s-line" x="56" y="160" width="208" height="8" />
<rect class="f-card s-line" x="70" y="168" width="180" height="8" />
<rect class="f-card s-line" x="84" y="176" width="152" height="10" />
<!-- cuốn sách mở ở bậc giữa: Hiến pháp -->
<path class="f-acc s-line" d="M140 180q10-6 20 0q10-6 20 0v6q-10-5-20 0q-10-5-20 0z" />
<path class="s-line s-thin" d="M160 180v6" />
