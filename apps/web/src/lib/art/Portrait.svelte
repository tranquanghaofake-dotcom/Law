<script lang="ts">
  // Chân dung bán thân cách điệu (spec thăng chức §3.4): người phẳng nét như các tranh khác, không mô phỏng người thật;
  // trang phục xét xử/kiểm sát vẽ giản lược, không cấp hiệu, phù hiệu thật. Nền là cảnh trụ sở theo nhánh/cấp.
  import type { Avatar } from '$lib/game/wardrobe';
  import type { ArtName } from './registry';
  import SubjectArt from './SubjectArt.svelte';
  import { ring, around } from './kit';
  let { avatar, scene = 'tam-quan' }: { avatar: Avatar; scene?: ArtName } = $props();
  const o = $derived(avatar.outfit);
  const sparks = around(200, 230, 170, 14);
</script>

<div class="portrait fx-{avatar.effect}">
  <div class="portrait-bg"><SubjectArt name={scene} /></div>
  <svg class="art portrait-fig" viewBox="0 0 400 500" aria-hidden="true" focusable="false">
    {#if avatar.effect === 'nang' || avatar.effect === 'trong-dong' || avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
      <circle cx="200" cy="200" r="150" class="f-sun" opacity=".85" />
    {/if}
    {#if avatar.effect === 'trong-dong' || avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
      <g class="sun-spin"><path class="f-sunline" d={ring(200, 200, 132, 148, 56)} /><circle class="kg" cx="200" cy="200" r="124" stroke-width="2" stroke-dasharray="2 7" /></g>
    {/if}
    {#if avatar.effect === 'hat-sang'}
      <g class="sparks">{#each sparks as s, i (i)}<circle cx={s.x} cy={s.y} r={i % 3 ? 2.2 : 3.4} class="f-acc" style="animation-delay:{i * 0.21}s" />{/each}</g>
    {/if}
    <!-- vai + trang phục -->
    {#if o === 'ao-choang'}
      <path class="f-void k" d="M70 500q0-120 80-140l50 30l50-30q80 20 80 140z" stroke-width="2.5" />
      <path class="f-seal" d="M150 360l50 30l50-30l8 14l-58 34l-58-34z" />
      <path class="f-card k" d="M178 366l22 22l22-22v-14h-44z" stroke-width="2" />
    {:else if o === 'dong-phuc-ks'}
      <path class="f-ksu k" d="M70 500q0-120 80-140l50 20l50-20q80 20 80 140z" stroke-width="2.5" />
      <path class="f-ksu2 k" d="M168 360l32 20l32-20v-10h-64z" stroke-width="2" />
      <g class="f-acc k" stroke-width="1.2"><circle cx="200" cy="410" r="5" /><circle cx="200" cy="440" r="5" /><circle cx="200" cy="470" r="5" /></g>
      <path class="k" d="M200 380v120" stroke-width="2" />
    {:else if o === 'ao-dai'}
      <path class="f-seal k" d="M70 500q0-120 80-140l50 10l50-10q80 20 80 140z" stroke-width="2.5" />
      <path class="f-acc k" d="M176 352h48v22q-24 10-48 0z" stroke-width="2" />
      <path class="ka" d="M120 420q20-10 40 0t40 0t40 0t40 0M110 460q22-10 45 0t45 0t45 0t45 0" stroke-width="2.4" fill="none" />
      <path class="k" d="M200 374v126" stroke-width="2" />
    {:else if o === 'vest'}
      <path class="f-card k" d="M168 360h64l-10 140h-44z" stroke-width="2" />
      <path class="f-ink k" d="M70 500q0-120 80-140l30 60l20-30l20 30l30-60q80 20 80 140z" stroke-width="2.5" />
      <path class="f-seal k" d="M193 372h14l4 10l-6 46l-5 8l-5-8l-6-46z" stroke-width="1.6" />
      <path class="kp" d="M150 360l38 70M250 360l-38 70" stroke-width="2" />
    {:else}
      <path class="f-card k" d="M70 500q0-120 80-140l50 24l50-24q80 20 80 140z" stroke-width="2.5" />
      <path class="f-cream k" d="M160 360l40 28l-20 22zM240 360l-40 28l20 22z" stroke-width="2" />
      <path class="k" d="M200 388v112" stroke-width="1.6" />
      <g class="f-line"><circle cx="200" cy="420" r="3" /><circle cx="200" cy="450" r="3" /><circle cx="200" cy="480" r="3" /></g>
    {/if}
    <!-- cổ, đầu -->
    {#if avatar.hair === 'dai'}<path class="f-void" d="M130 214q-8 80 8 118q8 10 22 12h80q14-2 22-12q16-38 8-118z" />{/if}
    <path class="f-skin k" d="M180 312v40q20 14 40 0v-40z" stroke-width="2" />
    <ellipse class="f-skin k" cx="200" cy="245" rx="68" ry="82" stroke-width="2.5" />
    <ellipse class="f-skin k" cx="132" cy="252" rx="10" ry="16" stroke-width="2" /><ellipse class="f-skin k" cx="268" cy="252" rx="10" ry="16" stroke-width="2" />
    {#if avatar.hair === 'dai'}
      <path class="f-void k" d="M130 236q-4-84 70-90q74 6 70 90q-30-34-70-40q-40 6-70 40z" stroke-width="2" />
    {:else}
      <path class="f-void k" d="M132 226q0-74 68-78q70 4 68 78q-16-30-40-36q-20 14-60 8q-24 6-36 28z" stroke-width="2" />
    {/if}
    <!-- mặt -->
    <path class="k" d="M168 232q10-6 20 0M212 232q10-6 20 0" stroke-width="2.6" />
    <g class="f-ink"><ellipse cx="178" cy="250" rx="5" ry="6" /><ellipse cx="222" cy="250" rx="5" ry="6" /></g>
    <path class="k" d="M200 256q-6 20 2 24" stroke-width="2" />
    <path class="k" d="M184 296q16 10 32 0" stroke-width="2.6" />
    <g class="f-lotus" opacity=".55"><circle cx="160" cy="280" r="9" /><circle cx="240" cy="280" r="9" /></g>
    <!-- phụ kiện -->
    {#if avatar.accessory === 'kinh'}
      <g class="k" stroke-width="2.6" fill="none"><circle cx="178" cy="252" r="16" /><circle cx="222" cy="252" r="16" /><path d="M194 250h12M162 248l-26-4M238 248l26-4" /></g>
    {:else if avatar.accessory === 'but'}
      <path class="f-acc2 k" d="M244 408l14-34l6 2l-12 36z" stroke-width="1.6" /><rect class="f-card k" x="236" y="410" width="30" height="8" stroke-width="1.4" />
    {:else if avatar.accessory === 'so'}
      <g transform="rotate(-10 300 450)"><rect class="f-seal k" x="268" y="410" width="60" height="80" rx="4" stroke-width="2" /><path class="ka" d="M280 430h36M280 442h28" stroke-width="2" /></g>
    {:else if avatar.accessory === 'cap'}
      <rect class="f-acc2 k" x="34" y="420" width="96" height="66" rx="6" stroke-width="2.2" /><path class="k" d="M66 420v-10h32v10M34 446h96" stroke-width="2.2" /><rect class="f-acc k" x="76" y="440" width="12" height="12" stroke-width="1.4" />
    {:else if avatar.accessory === 'huy-hieu'}
      <circle class="f-acc k" cx="250" cy="410" r="12" stroke-width="1.8" /><path class="f-sun" d={ring(250, 410, 6, 10, 12)} /><circle class="f-seal" cx="250" cy="410" r="4" />
    {/if}
    {#if avatar.effect === 'khung-vang' || avatar.effect === 'hat-sang'}
      <rect x="8" y="8" width="384" height="484" rx="14" fill="none" class="s-goldline" stroke-width="6" /><rect x="20" y="20" width="360" height="460" rx="10" fill="none" class="s-goldline" stroke-width="2" />
    {/if}
  </svg>
</div>
