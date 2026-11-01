<script lang="ts">
  // Dải khái niệm của đợt cho màn < 1024 px (thay cột đợt bên phải).
  import type { Concept, Level } from '$lib/content/types';
  let { concepts, levels, current }: { concepts: Concept[]; levels: Record<string, Level>; current: string } = $props();
</script>
<ol class="lesson-strip" aria-label="Khái niệm trong đợt">
  {#each concepts as c (c.id)}
    {@const lv = levels[c.id] ?? 0}
    <li class:current={c.id === current}><span class="ring mini" style="--p:{(lv / 6) * 100}" aria-hidden="true"><b>{lv}</b></span><span>{c.term}</span><span class="sr-only">bậc {lv}</span></li>
  {/each}
</ol>
