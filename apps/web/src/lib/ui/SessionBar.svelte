<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import ComboMeter from '$lib/ui/session/ComboMeter.svelte';
  import { fireStyle, glowLevel } from '$lib/ui/session/combo';
  import XpCounter from '$lib/ui/session/XpCounter.svelte';
  import type { BarMark } from '$lib/ui/session/marks';
  let { done = 0, total = 1, onexit, title, combo = 0, marks = [], inRetry = false, xp }: { xp?: number; done?: number; total?: number; onexit?: () => void; title?: string; combo?: number; marks?: BarMark[]; inRetry?: boolean } = $props();
  const pct = $derived(total ? Math.min(100, (done / total) * 100) : 0);

  // màu thanh theo đúng mốc của viền và ngọn lửa (combo.ts); chuỗi về 0 thì giữ màu cũ trong lúc mờ đi
  // svelte-ignore state_referenced_locally
  let held = $state(combo);
  $effect(() => { if (combo > 0) held = combo; });
  const fire = $derived(combo > 0);
  const head = $derived(fire && glowLevel(combo) >= 3);
</script>

<div class="session-bar" style={fireStyle(held)}>
  <button class="exit" type="button" onclick={onexit} aria-label="Thoát phiên, giữ tiến độ"><Glyph name="back" size={20} /></button>
  {#if title}<span class="title">{title}</span>{/if}
  <div class="progress" class:retry={inRetry} class:fire role="progressbar" aria-label={inRetry ? 'Tiến độ vòng sửa sai' : 'Tiến độ phiên'} aria-valuemin="0" aria-valuemax={total} aria-valuenow={done}>
    <span style="width:{pct}%"></span>
    {#each marks as m (m.kind + m.at)}<i aria-hidden="true" class="mark {m.kind}" class:passed={done > m.at} style="left:{total ? (m.at / total) * 100 : 0}%" title={m.label}></i>{/each}
    <em class="head" class:on={head} aria-hidden="true" style="left:{pct}%"></em>
  </div>
  <ComboMeter {combo} />
  {#if xp !== undefined}<XpCounter value={xp} />{/if}
  <span class="count">{inRetry ? 'Sửa sai ' : ''}{done}/{total}</span>
</div>
