<script lang="ts">
  // "Vì sao" sau câu trả lời (đề xuất ② spec phương pháp học). Dựng bởi engine/why.ts từ dữ liệu đã kiểm; không thêm khẳng định mới.
  import type { Concept } from '$lib/content/types';
  import type { StepItem } from '$lib/engine/session';
  import { segments, whyOf } from '$lib/engine/why';
  let { concept, item, correct, explain = '', chosen, confusables = [] }: {
    concept: Concept; item: StepItem; correct: boolean; explain?: string; chosen?: string; confusables?: Concept[];
  } = $props();
  const why = $derived(whyOf(concept, item, { correct, explain, chosen, confusables }));
  // khái niệm đã có Hiểu nhanh (lời thường): không đặt đoạn nguyên văn dày đặc lên trước — nguyên văn ở "Xem thêm"
  const plainFirst = $derived(!!concept.memo?.gist);
  // câu phân biệt do người soạn cho đúng cặp đang nhầm: thay hai cột cụm từ
  const contrast = $derived(why?.mixup ? concept.memo?.contrast?.find((x) => x.with === why.mixup?.id)?.text ?? null : null);
</script>

{#if why && !correct && !(plainFirst && !why.mixup && !why.wrong)}
  <section class="why" aria-label="Vì sao">
      <p class="why-title">Vì sao?</p>
      {#if why.wrong}
        <p class="why-wrong"><b>Bạn chọn «{why.wrong.option}»:</b> {why.wrong.text}</p>
      {/if}
      {#if why.excerpt && !plainFirst}
        <blockquote class="why-quote">{#each segments(why.excerpt.text, why.excerpt.marks) as s, k (k)}{#if s.b}<mark>{s.t}</mark>{:else}{s.t}{/if}{/each}</blockquote>
      {/if}
      {#if contrast && why.mixup}
        <p class="why-contrast"><b>{why.mixup.picked ? 'Bạn chọn' : 'Dễ nhầm'} «{why.mixup.term}».</b> {contrast}</p>
      {:else if why.mixup}
        <div class="why-mixup small" role="group" aria-label="{why.mixup.picked ? 'Bạn chọn' : 'Dễ nhầm với'} «{why.mixup.term}»">
          <div class="mix-col theirs"><p class="mix-h">{why.mixup.picked ? 'Bạn chọn' : 'Dễ nhầm'}: «{why.mixup.term}»</p><ul>{#each why.mixup.theirs as k (k)}<li>{k}</li>{/each}</ul></div>
          <div class="mix-col ours"><p class="mix-h">Đúng: «{concept.term}»</p><ul>{#each why.mixup.ours as k (k)}<li>{k}</li>{/each}</ul></div>
        </div>
      {/if}
  </section>
{/if}
