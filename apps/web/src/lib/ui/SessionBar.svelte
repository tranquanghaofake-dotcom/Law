<script lang="ts">
  import ComboMeter from '$lib/ui/session/ComboMeter.svelte';
  import type { BarMark } from '$lib/ui/session/marks';
  let { done = 0, total = 1, onexit, title, combo = 0, marks = [] }: { done?: number; total?: number; onexit?: () => void; title?: string; combo?: number; marks?: BarMark[] } = $props();
  const pct = $derived(total ? Math.min(100, (done / total) * 100) : 0);
</script>

<div class="session-bar">
  <button class="exit" type="button" onclick={onexit} aria-label="Thoát phiên, giữ tiến độ">←</button>
  {#if title}<span class="title">{title}</span>{/if}
  <div class="progress" role="progressbar" aria-label="Tiến độ phiên" aria-valuemin="0" aria-valuemax={total} aria-valuenow={done}>
    <span style="width:{pct}%"></span>
    {#each marks as m (m.kind + m.at)}<i aria-hidden="true" class="mark {m.kind}" class:passed={done > m.at} style="left:{total ? (m.at / total) * 100 : 0}%" title={m.label}></i>{/each}
  </div>
  <ComboMeter {combo} />
  <span class="count">{done}/{total}</span>
</div>
