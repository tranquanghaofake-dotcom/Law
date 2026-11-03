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

{#if why}
  {#if correct}
    <p class="why-sign small"><b>Dấu hiệu quyết định:</b> {why.signs.join(' · ')}</p>
  {:else}
    <section class="why" aria-label="Vì sao">
      <p class="why-title">Vì sao?</p>
      {#if why.excerpt}
        <blockquote class="why-quote">{#each segments(why.excerpt.text, why.excerpt.marks) as s, k (k)}{#if s.b}<mark>{s.t}</mark>{:else}{s.t}{/if}{/each}</blockquote>
      {/if}
      {#if why.plain}<p class="why-plain small">Nói gọn: {why.plain}</p>{/if}
      {#if why.signs.length}<p class="why-signs small"><b>Dấu hiệu:</b> {#each why.signs as k (k)}<span class="chip">{k}</span>{/each}</p>{/if}
      {#if why.mixup}
        <p class="why-mixup small">{why.mixup.picked ? 'Bạn chọn' : 'Dễ nhầm với'} <b>«{why.mixup.term}»</b>: dấu hiệu bên kia là {why.mixup.theirs.join('; ')}; còn «{concept.term}» là {why.mixup.ours.join('; ')}.</p>
      {:else if confusables.length}
        <p class="why-names small">Dễ nhầm với: <b>{confusables.map((c) => c.term).join(', ')}</b></p>
      {/if}
    </section>
  {/if}
{/if}
