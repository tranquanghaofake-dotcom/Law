<script lang="ts">
  // "Vì sao" sau câu trả lời (đề xuất ② spec phương pháp học). Dựng bởi engine/why.ts từ dữ liệu đã kiểm; không thêm khẳng định mới.
  import type { Concept } from '$lib/content/types';
  import type { StepItem } from '$lib/engine/session';
  import { segments, whyOf } from '$lib/engine/why';
  let { concept, item, correct, explain = '', chosen, confusables = [] }: {
    concept: Concept; item: StepItem; correct: boolean; explain?: string; chosen?: string; confusables?: Concept[];
  } = $props();
  const why = $derived(whyOf(concept, item, { correct, explain, chosen, confusables }));
</script>

{#if why && !correct}
  <section class="why" aria-label="Vì sao">
      <p class="why-title">Vì sao?</p>
      {#if why.excerpt}
        <blockquote class="why-quote">{#each segments(why.excerpt.text, why.excerpt.marks) as s, k (k)}{#if s.b}<mark>{s.t}</mark>{:else}{s.t}{/if}{/each}</blockquote>
      {/if}
      {#if why.mixup}
        <div class="why-mixup small" role="group" aria-label="{why.mixup.picked ? 'Bạn chọn' : 'Dễ nhầm với'} «{why.mixup.term}»">
          <div class="mix-col theirs"><p class="mix-h">{why.mixup.picked ? 'Bạn chọn' : 'Dễ nhầm'}: «{why.mixup.term}»</p><ul>{#each why.mixup.theirs as k (k)}<li>{k}</li>{/each}</ul></div>
          <div class="mix-col ours"><p class="mix-h">Đúng: «{concept.term}»</p><ul>{#each why.mixup.ours as k (k)}<li>{k}</li>{/each}</ul></div>
        </div>
      {:else if confusables.length}
        <p class="why-names small">Dễ nhầm với: <b>{confusables.map((c) => c.term).join(', ')}</b></p>
      {/if}
  </section>
{/if}
