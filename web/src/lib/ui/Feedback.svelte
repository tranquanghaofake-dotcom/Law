<script lang="ts">
  import type { Concept, Item } from '$lib/content/types';
  import type { IntroItem } from '$lib/engine/session';
  import type { AnswerResult } from './cards/types';
  import { isTypingTarget } from './cards/types';
  let { result, item, concept, confusableTerms = [], onnext, onspeak, last = false }: {
    result: AnswerResult; item: Item | IntroItem; concept: Concept; confusableTerms?: string[];
    onnext: () => void; onspeak?: (t: string) => void; last?: boolean;
  } = $props();

  const correctText = $derived.by(() => {
    switch (item.type) {
      case 'mcq': case 'case': return item.options[item.answer];
      case 'truefalse': return item.answer ? 'Đúng' : 'Sai';
      case 'cloze': return [...item.text.matchAll(/\{\{([^{}]+)\}\}/g)].map((m) => m[1]).join(' · ');
      default: return '';
    }
  });
  const explain = $derived('explain' in item ? item.explain : item.type === 'recall' ? item.model : '');
  const source = $derived(('source' in item && item.source) ? item.source : concept.source);
  const speakText = $derived(result.correct ? explain : `Đáp án: ${correctText}. ${explain}`);

  function focusOnMount(node: HTMLElement) { node.focus({ preventScroll: true }); }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    if (e.key === 'Enter') { e.preventDefault(); onnext(); }
    if (e.key === ' ' && onspeak) { e.preventDefault(); onspeak(speakText); }
  }
</script>

<svelte:window onkeydown={onkey} />
<div class="feedback {result.correct ? 'ok' : 'bad'}" role="status" aria-live="polite">
  <p class="verdict">{result.correct ? 'Chính xác.' : `Chưa đúng.${correctText ? ` Đáp án: ${correctText}` : ''}`}
    {#if onspeak}<button class="speak" type="button" aria-label="Nghe giải thích" title="Nghe (Space)" onclick={() => onspeak?.(speakText)}>🔊</button>{/if}
  </p>
  {#if explain}<p>{explain}</p>{/if}
  <p class="source muted">Nguồn: {source.cite}{#if source.url} · <a href={source.url} target="_blank" rel="noopener">Xem văn bản</a>{/if}</p>
  {#if !result.correct && confusableTerms.length}<p class="muted">Dễ nhầm với: <b>{confusableTerms.join(', ')}</b></p>{/if}
  <button class="btn" type="button" onclick={onnext} use:focusOnMount>{last ? 'Xem kết quả' : 'Câu tiếp →'} <kbd>↵</kbd></button>
</div>
