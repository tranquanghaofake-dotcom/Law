<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { CardProps } from './types';
  import type { IntroItem } from '$lib/engine/session';
  import { isTypingTarget } from './types';
  let { concept, onanswer, onspeak }: CardProps<IntroItem> = $props();
  const start = Date.now();
  let done = false;
  function ok() { if (done) return; done = true; onanswer({ correct: true, elapsedMs: Date.now() - start }); }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    if (e.key === 'Enter') { e.preventDefault(); ok(); }
    if (e.key === ' ' && onspeak) { e.preventDefault(); onspeak(`${concept.term}. ${concept.definition}`); }
  }
</script>

<svelte:window onkeydown={onkey} />
<article class="card concept-card" aria-label="Thẻ giới thiệu khái niệm">
  <p class="kicker">Khái niệm mới</p>
  <h2 class="term">{concept.term}
    {#if onspeak}<button class="speak" type="button" aria-label="Nghe định nghĩa" title="Nghe (Space)" onclick={() => onspeak?.(`${concept.term}. ${concept.definition}`)}><Glyph name="speaker" /></button>{/if}
  </h2>
  <blockquote class="quote">{concept.definition}</blockquote>
  <p class="plain">{concept.plain}</p>
  <p class="example"><b>Ví dụ:</b> {concept.example}</p>
  {#if concept.note}<p class="note"><b>Cập nhật luật:</b> {concept.note}</p>{/if}
  <p class="source muted">Nguồn: {concept.source.cite}{#if concept.source.url} · <a href={concept.source.url} target="_blank" rel="noopener">Xem văn bản</a>{/if}</p>
  <button class="btn primary" type="button" onclick={ok}>Đã hiểu <kbd>↵</kbd></button>
</article>
