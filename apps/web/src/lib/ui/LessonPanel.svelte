<script lang="ts">
  import type { Concept, Level } from '$lib/content/types';
  import { LEVEL_NAMES } from '$lib/game/levels';
  let { concepts, levels, current }: { concepts: Concept[]; levels: Record<string, Level>; current: string } = $props();
</script>

<aside class="aside lesson-panel" aria-label="Khái niệm trong đợt">
  <p class="kicker">Đợt này</p>
  <ul>
    {#each concepts as c (c.id)}
      {@const lv = levels[c.id] ?? 0}
      <li class:current={c.id === current}>
        <span class="ring" style="--p:{(lv / 6) * 100}" role="img" aria-label="Bậc {lv} trên 6"><b>{lv}</b></span>
        <span class="info"><span class="term">{c.term}</span><span class="muted small">{LEVEL_NAMES[lv]}</span></span>
      </li>
    {/each}
  </ul>
  <p class="muted small">Bậc 0–6: mỗi lần đúng lên một bậc, sai tụt một bậc. Bậc 6 vào vòng ôn.</p>
</aside>

<ol class="lesson-strip" aria-label="Khái niệm trong đợt">
  {#each concepts as c (c.id)}
    {@const lv = levels[c.id] ?? 0}
    <li class:current={c.id === current}><span class="ring mini" style="--p:{(lv / 6) * 100}" aria-hidden="true"><b>{lv}</b></span><span>{c.term}</span><span class="sr-only">bậc {lv}</span></li>
  {/each}
</ol>
