<script lang="ts">
  // "Ghi nhớ nhanh" sau câu trả lời: sơ đồ nhánh (gốc = khái niệm, nhánh = dấu hiệu hoặc sơ đồ người soạn), lời gọn 1 câu,
  // ví dụ và giải thích đầy đủ để mở thêm. Dữ liệu dựng bởi engine/memo.ts.
  import type { Concept } from '$lib/content/types';
  import type { StepItem } from '$lib/engine/session';
  import { branchesOf, emphasis, gistOf } from '$lib/engine/memo';
  let { concept, item }: { concept: Concept; item: StepItem } = $props();
  const map = $derived(branchesOf(concept));
  const gist = $derived(gistOf(concept, item));
  const hook = $derived(concept.memo?.hook ?? null);
</script>

<section class="memo" aria-label="Ghi nhớ nhanh">
  {#if map.nodes.length}
    <div class="memo-map">
      <p class="memo-root">{concept.term}</p>
      <ul class="memo-tree">
        {#each map.nodes as n, i (i)}
          <li class="memo-branch" style="--i:{i}">
            <span class="memo-node">{n.label}</span>
            {#if n.children.length}<ul class="memo-leaves">{#each n.children as ch, j (j)}<li class="memo-leaf">{ch}</li>{/each}</ul>{/if}
          </li>
        {/each}
      </ul>
    </div>
  {/if}
  {#if hook}<p class="memo-hook"><span aria-hidden="true">💡</span> {#each emphasis(hook) as s, k (k)}{#if s.b}<b>{s.t}</b>{:else}{s.t}{/if}{/each}</p>{/if}
  {#if map.authored || hook}<p class="memo-tag small muted">Sơ đồ/mẹo nhớ: Diễn giải để học, không phải nguyên văn.</p>{/if}
  {#if !(hook && gist.fromPlain)}<p class="memo-lead">{#each emphasis(gist.lead) as s, k (k)}{#if s.b}<b>{s.t}</b>{:else}{s.t}{/if}{/each}</p>{/if}
  {#if concept.example || gist.full}
    <div class="memo-more-row">
      {#if concept.example}<details class="memo-more"><summary>Ví dụ</summary><p class="small">{concept.example}</p></details>{/if}
      {#if gist.full}<details class="memo-more"><summary>Giải thích đầy đủ</summary><p class="small">{gist.full}</p></details>{/if}
    </div>
  {/if}
</section>
