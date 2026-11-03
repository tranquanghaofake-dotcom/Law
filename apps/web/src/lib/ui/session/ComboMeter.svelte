<script lang="ts">
  // Thanh combo: lửa lớn dần theo mức (2 · 5 · 10 câu đúng liên tiếp). Hiện cạnh thanh tiến độ.
  import Glyph from '$lib/art/Glyph.svelte';
  import { comboTier } from './combo';
  let { combo = 0 }: { combo?: number } = $props();
  const t = $derived(comboTier(combo));
  const size = $derived([18, 20, 26, 32][t.tier]);
</script>

{#if t.tier > 0}
  <span class="combo t{t.tier}" role="status" aria-label="Chuỗi đúng {combo} câu{t.mult > 1 ? `, nhân ${t.label}` : ''}">
    <span class="flame" aria-hidden="true"><Glyph name="flame" {size} /></span>
    <b>{combo}</b>
    {#if t.mult > 1}<small>{t.label}</small>{/if}
    {#if t.next}<i class="meter" aria-hidden="true"><span style="width:{t.progress * 100}%"></span></i>{/if}
  </span>
{/if}
