<!-- Núi đá vôi trên vịnh, thuyền buồm (cảm hứng vịnh Hạ Long — cách điệu). -->
<script lang="ts">
  import Clouds from './Clouds.svelte';
  const battens = [0, 1, 2, 3, 4, 5];
</script>

<Clouds ground={false} cy={78} r={56} />
<!-- dãy núi xa -->
<path class="f-hill" d="M0 150c10-30 14-58 30-60c14 0 12 34 22 34c8 0 6-44 26-46c18 0 14 50 26 50c10 0 10-20 20-20c10 0 8 42 20 42h176v20H0z" />
<!-- núi gần, nét nếp đá -->
<path class="f-hill2 s-line" d="M176 152c-6-40 2-86 22-90c16-2 18 30 24 30c8 0 8-34 24-34c18 0 22 50 18 94z" />
<path class="s-line s-thin" d="M192 80c-4 20-2 46 2 70M210 96c-2 18 0 40 4 54M240 70c2 24 0 54-2 80M254 100c0 18-2 34-4 50" />
<path class="f-hill2 s-line" d="M40 152c-4-28 4-58 18-60c14-2 16 24 22 24c6 0 8-14 16-14c12 0 14 26 10 50z" />
<path class="s-line s-thin" d="M56 98c-4 16-2 34 0 52M90 108c0 14 0 28-2 42" />
<!-- mặt nước -->
<rect class="f-water" x="0" y="150" width="320" height="50" />
<g class="s-water s-line s-thin"><path d="M20 162h40M90 170h30M180 160h50M250 174h40M30 186h24M140 190h50M230 192h30" /><path d="M196 160v8M214 162v6M244 160v10" /></g>
<!-- thuyền buồm -->
<g>
  <path class="f-seal s-line" d="M110 150v-54q-16 26-16 54z" />
  <path class="f-seal s-line" d="M122 150v-66q24 30 22 66z" />
  <path class="f-seal s-line" d="M146 150v-40q14 18 12 40z" />
  <g class="s-line s-thin s-paper">
    {#each battens as i (i)}<path d="M{98 + i * 1.5} {104 + i * 8}h{10 - i * 0.4}M{124} {94 + i * 9}h{14 + i * 1.2}" />{/each}
  </g>
  <path class="s-line" d="M110 96v58M122 84v70M146 110v44" />
  <path class="f-ink s-line" d="M86 152h82l-8 12h-66z" />
  <path class="s-water s-line s-thin" d="M92 170h60M100 176h44" />
</g>
<!-- chim -->
<path class="s-line s-thin" d="M60 50q4-4 8 0q4-4 8 0M84 40q3-3 6 0q3-3 6 0M250 112q3-3 6 0q3-3 6 0" />
