<script lang="ts">
  // Bảng so sánh hai khái niệm dễ nhầm (đề xuất ④): hai cột, hàng = định nghĩa rút gọn / dấu hiệu / ví dụ. Xếp dọc trên điện thoại.
  import type { Concept } from '$lib/content/types';
  import { compareConcepts } from '$lib/engine/compare';
  let { a, b }: { a: Concept; b: Concept } = $props();
  const cmp = $derived(compareConcepts(a, b));
</script>

{#if cmp}
  <div class="cmp" role="table" aria-label="So sánh {cmp.a.term} và {cmp.b.term}">
    {#if cmp.common}<p class="cmp-common small muted">{cmp.common}</p>{/if}
    <div class="cmp-head" role="row"><span role="columnheader" class="cmp-a">{cmp.a.term}</span><span role="columnheader" class="cmp-b">{cmp.b.term}</span></div>
    {#each cmp.rows as r (r.label)}
      <div class="cmp-row" role="row">
        <div class="cmp-label" role="rowheader">{r.label}</div>
        {#if r.kind === 'text'}
          <div class="cmp-a" role="cell"><b class="cmp-who">{cmp.a.term}:</b>{' '}{r.a}</div><div class="cmp-b" role="cell"><b class="cmp-who">{cmp.b.term}:</b>{' '}{r.b}</div>
        {:else}
          <div class="cmp-a" role="cell"><b class="cmp-who">{cmp.a.term}:</b>{' '}{#each r.a as k (k)}<span class="chip">{k}</span>{:else}—{/each}</div>
          <div class="cmp-b" role="cell"><b class="cmp-who">{cmp.b.term}:</b>{' '}{#each r.b as k (k)}<span class="chip">{k}</span>{:else}—{/each}</div>
        {/if}
      </div>
    {/each}
  </div>
{/if}
