<script lang="ts">
  import type { Reveal } from '$lib/fx/reveal.svelte';
  let { reveal, src, cols = 5 }: { reveal: Reveal; src: string; cols?: number } = $props();
  const rows = $derived(Math.ceil(reveal.total / cols));
</script>

<div class="reveal" aria-hidden="true" style="--cols:{cols};--rows:{rows};background-image:url({src})">
  {#each reveal.tiles as open, i (i)}
    <div class="tile" class:open></div>
  {/each}
</div>
