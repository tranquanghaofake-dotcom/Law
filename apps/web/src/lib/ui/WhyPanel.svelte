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
  // "Dễ nhầm" mà bạn không chọn, trong khi đã có lời giải thích đúng lỗi bạn mắc: chỉ là thông tin phụ → gập lại
  const mixupMore = $derived(!!why?.mixup && !why.mixup.picked && !!why.wrong);
  const contrast = $derived(why?.mixup ? concept.memo?.contrast?.find((x) => x.with === why.mixup?.id)?.text ?? null : null);
</script>

{#snippet mix(m: NonNullable<NonNullable<typeof why>['mixup']>)}
  {#if contrast}
    <p class="why-contrast"><b>{m.picked ? 'Bạn chọn' : 'Dễ nhầm'} «{m.term}».</b> {contrast}</p>
  {:else}
    <div class="why-mixup small" role="group" aria-label="{m.picked ? 'Bạn chọn' : 'Dễ nhầm với'} «{m.term}»">
      <div class="mix-col theirs"><p class="mix-h">{m.picked ? 'Bạn chọn' : 'Dễ nhầm'}: «{m.term}»</p><ul>{#each m.theirs as k (k)}<li>{k}</li>{/each}</ul></div>
      <div class="mix-col ours"><p class="mix-h">Đúng: «{concept.term}»</p><ul>{#each m.ours as k (k)}<li>{k}</li>{/each}</ul></div>
    </div>
  {/if}
{/snippet}

{#if why && correct && why.right}
  <section class="why why-ok" aria-label="Vì sao đúng">
    <p class="why-title">Vì sao đúng?</p>
    <p class="why-right">{why.right}</p>
  </section>
{:else if why && !correct && !(plainFirst && !why.mixup && !why.wrong && !why.right)}
  <section class="why" aria-label="Vì sao">
      <p class="why-title">Vì sao?</p>
      {#if why.wrong}
        <p class="why-wrong"><b>Bạn chọn «{why.wrong.option}»:</b> {why.wrong.text}</p>
      {/if}
      {#if why.right}
        <p class="why-right"><b>Đáp án đúng:</b> {why.right}</p>
      {/if}
      {#if why.excerpt && !plainFirst && !why.right}
        <blockquote class="why-quote">{#each segments(why.excerpt.text, why.excerpt.marks) as s, k (k)}{#if s.b}<mark>{s.t}</mark>{:else}{s.t}{/if}{/each}</blockquote>
      {/if}
      {#if why.mixup}
        {#if mixupMore}
          <details class="why-mixup-more small"><summary>Dễ nhầm với «{why.mixup.term}»</summary>{@render mix(why.mixup)}</details>
        {:else}
          {@render mix(why.mixup)}
        {/if}
      {/if}
  </section>
{/if}
