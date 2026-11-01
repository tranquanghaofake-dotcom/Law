<script lang="ts">
  import type { ItemCloze } from '$lib/content/types';
  import { buildBank, gradeCloze, parseCloze } from '$lib/engine/grading';
  import { isTypingTarget, type CardProps } from './types';
  let { concept, item, rng, onanswer, mode = 'type' }: CardProps<ItemCloze> & { mode?: 'bank' | 'type' } = $props();
  // Thẻ được remount theo từng bước (key), nên cố ý lấy giá trị ban đầu của item/rng.
  // svelte-ignore state_referenced_locally
  const start = Date.now();
  // svelte-ignore state_referenced_locally
  const { parts, blanks } = parseCloze(item.text);
  // svelte-ignore state_referenced_locally
  const bank = buildBank(blanks, item.bank_extra ?? [], rng);
  let answers = $state<string[]>(blanks.map(() => ''));
  let result = $state<{ correct: boolean; perBlank: boolean[] } | null>(null);
  const used = $derived(new Set(answers.filter(Boolean)));

  function fill(word: string) {
    if (result) return;
    const k = answers.findIndex((a) => !a);
    if (k < 0) return;
    answers[k] = word;
  }
  function clearBlank(k: number) { if (!result) answers[k] = ''; }
  function check() {
    if (result) return;
    if (answers.some((a) => !a.trim())) return;
    result = gradeCloze(blanks, answers, item.synonyms);
    onanswer({ correct: result.correct, elapsedMs: Date.now() - start, chosen: answers.join(' | ') });
  }
  function onkey(e: KeyboardEvent) {
    if (e.key === 'Enter' && (mode === 'type' ? true : !isTypingTarget(e))) { e.preventDefault(); check(); }
  }
</script>

<svelte:window onkeydown={onkey} />
<article class="card question-card cloze" aria-label="Điền chỗ trống">
  <p class="kicker">Điền chỗ trống · {concept.term}</p>
  <p class="question cloze-text">
    {#each parts as part, k}
      {part}{#if k < blanks.length}
        {#if mode === 'bank'}
          <button type="button" class="blank {result ? (result.perBlank[k] ? 'correct' : 'wrong') : ''}" class:filled={!!answers[k]} aria-label={answers[k] ? `Chỗ trống ${k + 1}: ${answers[k]}, bấm để xóa` : `Chỗ trống ${k + 1}`} onclick={() => clearBlank(k)}>{answers[k] || '…'}</button>
        {:else}
          <input class="blank-input {result ? (result.perBlank[k] ? 'correct' : 'wrong') : ''}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label={`Chỗ trống ${k + 1}`} bind:value={answers[k]} disabled={!!result} />
        {/if}
      {/if}
    {/each}
  </p>
  {#if mode === 'bank'}
    <div class="bank" role="group" aria-label="Ngân hàng từ">
      {#each bank as w}
        <button type="button" class="word" disabled={!!result || used.has(w)} onclick={() => fill(w)}>{w}</button>
      {/each}
    </div>
  {/if}
  {#if result && !result.correct}
    <p class="muted">Đáp án: <b>{blanks.join(' · ')}</b></p>
  {/if}
  <button class="btn primary" type="button" disabled={!!result || answers.some((a) => !a.trim())} onclick={check}>Kiểm tra <kbd>↵</kbd></button>
</article>
