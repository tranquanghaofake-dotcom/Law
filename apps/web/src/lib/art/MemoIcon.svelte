<script lang="ts">
  // Icon nhánh sơ đồ ghi nhớ (bộ nét mảnh trong memoIcons.ts). Trang trí: aria-hidden, nhãn chữ đi kèm đã đủ nghĩa.
  import type { MemoIcon } from '$lib/content/types';
  import { MEMO_ICON_ART } from './memoIcons';
  let { name, size = 18 }: { name: MemoIcon; size?: number } = $props();
  const els = $derived(MEMO_ICON_ART[name] ?? []);
</script>

<svg class="memo-icon" data-icon={name} viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false"
  fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  {#each els as e, i (i)}
    {#if typeof e === 'string'}<path d={e} />
    {:else if 'c' in e}<circle cx={e.c[0]} cy={e.c[1]} r={e.c[2]} />
    {:else}<text x="12" y="16.2" text-anchor="middle" font-size="11" font-weight="700" fill="currentColor" stroke="none">{e.t}</text>{/if}
  {/each}
</svg>
