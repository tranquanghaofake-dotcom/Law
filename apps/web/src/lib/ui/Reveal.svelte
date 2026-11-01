<script lang="ts">
  import type { Reveal } from '$lib/fx/reveal.svelte';
  let { reveal, src, cols = 5 }: { reveal: Reveal; src: string; cols?: number } = $props();
  const rows = $derived(Math.ceil(reveal.total / cols));
  // Vẽ đủ cols×rows ô để không hở nền; ô ngoài `total` luôn đóng.
  const cells = $derived(Array.from({ length: rows * cols }, (_, i) => reveal.tiles[i] ?? false));
</script>

<div class="reveal" aria-hidden="true" style="--cols:{cols};--rows:{rows};background-image:url({src})">
  {#each cells as open, i (i)}
    <div class="tile" class:open></div>
  {/each}
</div>
