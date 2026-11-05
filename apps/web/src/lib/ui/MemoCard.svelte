<script lang="ts">
  // "Ghi nhớ nhanh": mỗi nhánh sơ đồ một dòng ("Nhãn: ý · ý") + mẹo nhớ. Dùng ở thẻ đáp án và thẻ khái niệm đầu.
  // Chưa có sơ đồ người soạn: nhánh = dấu hiệu (keywords) và thêm một câu gọn (nếu có item). Dữ liệu dựng bởi engine/memo.ts.
  import type { Concept } from '$lib/content/types';
  import type { StepItem } from '$lib/engine/session';
  import { branchesOf, emphasis, gistOf } from '$lib/engine/memo';
  let { concept, item = null }: { concept: Concept; item?: StepItem | null } = $props();
  const map = $derived(branchesOf(concept));
  const hook = $derived(concept.memo?.hook ?? null);
  const lead = $derived(!map.authored && !hook && item ? gistOf(concept, item).lead : null);
</script>

<section class="memo" aria-label="Ghi nhớ nhanh">
  {#if map.nodes.length}
    <ul class="memo-rows">
      {#each map.nodes as n, i (i)}
        <li class="memo-row" style="--i:{i}"><b class="memo-k">{n.label}</b>{#if n.children.length}: <span class="memo-v">{n.children.join(' · ')}</span>{/if}</li>
      {/each}
    </ul>
  {/if}
  {#if hook}<p class="memo-hook"><span aria-hidden="true">💡</span> {#each emphasis(hook) as s, k (k)}{#if s.b}<b>{s.t}</b>{:else}{s.t}{/if}{/each}
    <span class="memo-tag" title="Diễn giải để học, không phải nguyên văn">diễn giải<span class="sr-only">: để học, không phải nguyên văn</span></span></p>{/if}
  {#if lead}<p class="memo-lead">{#each emphasis(lead) as s, k (k)}{#if s.b}<b>{s.t}</b>{:else}{s.t}{/if}{/each}</p>{/if}
</section>
