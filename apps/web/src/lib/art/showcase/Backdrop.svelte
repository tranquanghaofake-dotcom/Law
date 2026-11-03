<script lang="ts">
  // Phông sau chân dung: bầu trời (ban mai/trưa/hoàng hôn/đêm) + cảnh kiến trúc có sẵn (SubjectArt) phóng to, mờ nhẹ phía sau ma-nơ-canh.
  import SubjectArt from '../SubjectArt.svelte';
  import type { ArtName } from '../registry';
  import { SKY_GRADIENTS } from './tones';
  let { scene, sky = 'ban-mai' }: { scene: string; sky?: string } = $props();
</script>

<div class="sc-back" data-sky={sky} data-scene={scene} style="background:{SKY_GRADIENTS[sky] ?? SKY_GRADIENTS['ban-mai']}" aria-hidden="true">
  {#if sky === 'dem'}<span class="sc-stars"></span>{/if}
  <SubjectArt name={scene as ArtName} class="sc-scene" />
</div>
