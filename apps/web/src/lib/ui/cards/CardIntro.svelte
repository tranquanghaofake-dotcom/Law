<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { CardProps } from './types';
  import { introLayers, type IntroItem } from '$lib/engine/session';
  import { isInteractiveTarget, isTypingTarget } from './types';
  let { concept, onanswer, onspeak }: CardProps<IntroItem> = $props();
  const start = Date.now();
  let done = false;
  // Ba lớp: (1) ví dụ → (2) dấu hiệu (chip) → (3) nguyên văn điều luật + nguồn, mở khi cần.
  // Khái niệm có ghi chú cập nhật luật thì mở sẵn lớp 3 để không bỏ sót.
  // svelte-ignore state_referenced_locally
  const layers = introLayers(concept);
  // svelte-ignore state_referenced_locally
  let open = $state(!!concept.note);
  function ok() { if (done) return; done = true; onanswer({ correct: true, elapsedMs: Date.now() - start }); }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    if ((e.key === 'Enter' || e.key === ' ') && isInteractiveTarget(e)) return;
    if (e.key === 'Enter') { e.preventDefault(); ok(); }
    if (e.key === ' ' && onspeak) { e.preventDefault(); onspeak(`${concept.term}. ${concept.definition}`); }
  }
</script>

<svelte:window onkeydown={onkey} />
<article class="card concept-card intro-layers" aria-label="Thẻ giới thiệu khái niệm">
  <p class="kicker">Khái niệm mới</p>
  <h2 class="term">{concept.term}
    {#if onspeak}<button class="speak" type="button" aria-label="Nghe định nghĩa" title="Nghe (Space)" onclick={() => onspeak?.(`${concept.term}. ${concept.definition}`)}><Glyph name="speaker" /></button>{/if}
  </h2>
  <p class="intro-example"><b>Ví dụ:</b> {layers.example}</p>
  <p class="plain">{layers.plain}</p>
  {#if layers.cues.length}
    <ul class="intro-cues" aria-label="Dấu hiệu nhận biết">
      {#each layers.cues as cue (cue.text)}<li class="chip" class:note={!cue.verbatim} title={cue.verbatim ? 'Có nguyên văn trong định nghĩa' : 'Dấu hiệu tóm tắt — không phải nguyên văn điều luật'}>{cue.text}{#if !cue.verbatim}<span class="sr-only"> (tóm tắt, không phải nguyên văn)</span>{/if}</li>{/each}
    </ul>
    {#if layers.cues.some((c) => !c.verbatim)}<p class="small muted intro-cue-key">Chữ nghiêng: dấu hiệu tóm tắt, không phải nguyên văn điều luật.</p>{/if}
  {/if}
  <button class="btn ghost plain intro-toggle" type="button" aria-expanded={open} aria-controls="intro-verbatim" onclick={() => (open = !open)}>
    {open ? 'Ẩn nguyên văn điều luật' : 'Xem nguyên văn điều luật'}
  </button>
  {#if open}
    <div id="intro-verbatim">
      <blockquote class="quote">{layers.definition}</blockquote>
      {#if concept.note}<p class="note"><b>Cập nhật luật:</b> {concept.note}</p>{/if}
      <p class="source muted">Nguồn: {layers.source.cite}{#if layers.source.url} · <a href={layers.source.url} target="_blank" rel="noopener">Xem văn bản</a>{/if}</p>
    </div>
  {:else}
    <p class="source muted small">Nguồn: {layers.source.cite}</p>
  {/if}
  <button class="btn primary" type="button" onclick={ok}>Đã hiểu <kbd>↵</kbd></button>
</article>
