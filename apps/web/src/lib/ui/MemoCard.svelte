<script lang="ts">
  // "Ghi nhớ nhanh": Hiểu nhanh (câu lời thường) → hình theo loại khái niệm → mẹo nhớ. Dùng ở thẻ đáp án và thẻ khái niệm đầu.
  // Hình vẽ: bậc thang = lát kim tự tháp SVG (rộng dần xuống dưới), các bước nối bằng mũi tên ↓, nhánh có biểu tượng (memo.tree[].icon).
  // Kiểu hình (memo.kind): ladder = bậc thang thứ bậc, checklist = điều kiện ✓, steps = các bước 1-2-3, compare = hai cột, tree = mỗi nhánh một dòng.
  // Chưa có sơ đồ người soạn: nhánh = dấu hiệu (keywords) và thêm một câu gọn (nếu có item). Dữ liệu dựng bởi engine/memo.ts.
  import type { Concept } from '$lib/content/types';
  import type { StepItem } from '$lib/engine/session';
  import { branchesOf, emphasis, gistOf, type Branch } from '$lib/engine/memo';
  import MemoIcon from '$lib/art/MemoIcon.svelte';
  import Glyph from '$lib/art/Glyph.svelte';
  let { concept, item = null }: { concept: Concept; item?: StepItem | null } = $props();
  const map = $derived(branchesOf(concept));
  const gist = $derived(concept.memo?.gist ?? null);
  const kind = $derived(concept.memo?.kind ?? 'tree');
  const hook = $derived(concept.memo?.hook ?? null);
  const lead = $derived(!gist && !map.authored && !hook && item ? gistOf(concept, item).lead : null);
  const cols = $derived(kind === 'compare' ? map.nodes.slice(0, 2) : []);
  const rest = $derived(kind === 'compare' ? map.nodes.slice(2) : map.nodes);
  // lát thứ i của kim tự tháp n tầng (khung 100×100): cạnh trên rộng i/n, cạnh dưới (i+1)/n
  const r1 = (x: number) => String(Math.round(x * 10) / 10);
  const tier = (i: number, n: number) => {
    const t = (50 * i) / n, b = (50 * (i + 1)) / n;
    return `${r1(50 - t)},0 ${r1(50 + t)},0 ${r1(50 + b)},100 ${r1(50 - b)},100`;
  };
</script>

{#snippet line(n: Branch)}{#if n.icon}<MemoIcon name={n.icon} />{/if}<b class="memo-k">{n.label}</b>{#if n.children.length}: <span class="memo-v">{n.children.join(' · ')}</span>{/if}{/snippet}

<section class="memo" aria-label="Ghi nhớ nhanh" data-kind={kind}>
  {#if gist}<p class="memo-gist">{gist}</p>{/if}
  {#if map.nodes.length}
    {#if kind === 'ladder'}
      <ol class="memo-ladder" aria-label="Thứ bậc, từ cao xuống thấp">
        {#each map.nodes as n, i (i)}<li style="--i:{i}"><svg class="memo-tier" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points={tier(i, map.nodes.length)} /></svg><span class="memo-tier-t">{@render line(n)}</span></li>{/each}
      </ol>
    {:else if kind === 'checklist'}
      <ul class="memo-check" aria-label="Điều kiện">
        {#each map.nodes as n, i (i)}<li style="--i:{i}"><span class="memo-tick" aria-hidden="true"><Glyph name="check" size={12} /></span><span>{@render line(n)}</span></li>{/each}
      </ul>
    {:else if kind === 'steps'}
      <ol class="memo-steps" aria-label="Các bước">
        {#each map.nodes as n, i (i)}<li style="--i:{i}"><span class="memo-num" aria-hidden="true">{i + 1}{#if i < map.nodes.length - 1}<span class="memo-arrow">↓</span>{/if}</span><span>{@render line(n)}</span></li>{/each}
      </ol>
    {:else}
      {#if cols.length}
        <div class="memo-compare">
          {#each cols as n, i (i)}<div class="memo-col"><p class="memo-col-h">{#if n.icon}<MemoIcon name={n.icon} />{/if}{n.label}</p>{#if n.children.length}<ul>{#each n.children as ch, j (j)}<li>{ch}</li>{/each}</ul>{/if}</div>{/each}
        </div>
      {/if}
      {#if rest.length}
        <ul class="memo-rows">
          {#each rest as n, i (i)}<li class="memo-row" style="--i:{i}">{@render line(n)}</li>{/each}
        </ul>
      {/if}
    {/if}
  {/if}
  {#if hook}<p class="memo-hook"><MemoIcon name="idea" /> {#each emphasis(hook) as s, k (k)}{#if s.b}<b>{s.t}</b>{:else}{s.t}{/if}{/each}
    <span class="memo-tag" title="Diễn giải để học, không phải nguyên văn">diễn giải<span class="sr-only">: để học, không phải nguyên văn</span></span></p>{/if}
  {#if lead}<p class="memo-lead">{#each emphasis(lead) as s, k (k)}{#if s.b}<b>{s.t}</b>{:else}{s.t}{/if}{/each}</p>{/if}
</section>
