<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { CardProps } from './types';
  import { introLayers, type IntroItem } from '$lib/engine/session';
  import { isInteractiveTarget, isTypingTarget } from './types';
  import LegalNote from '../LegalNote.svelte';
  import MemoCard from '../MemoCard.svelte';
  import { promptSpeech } from '../session/speech';
  let { concept, onanswer, onspeak }: CardProps<IntroItem> = $props();
  const start = Date.now();
  let done = false;
  // Ba lớp (gọn lại đợt 3): (1) sơ đồ ghi nhớ + mẹo nhớ → (2) ví dụ → (3) nguyên văn điều luật + nguồn, mở khi cần.
  // Chưa có sơ đồ người soạn thì thêm đoạn giải nghĩa (plain).
  // Khái niệm có ghi chú cập nhật luật thì mở sẵn lớp 3 để không bỏ sót.
  // svelte-ignore state_referenced_locally
  const layers = introLayers(concept);
  // Ghi chú luật mới không còn tự mở (khối khó đọc nhất): chỉ hiện nhãn "⚠ Luật đã thay đổi", bấm mới mở.
  let open = $state(false);
  // tình huống hỏi–đáp: tự nghĩ trước, bấm mới hiện đáp (và đọc đáp)
  const quiz = $derived(concept.memo?.case ?? null);
  let reveal = $state(false);
  function showAnswer() { reveal = true; if (quiz) onspeak?.(`Đáp: ${quiz.a}`); }
  function ok() { if (done) return; done = true; onanswer({ correct: true, elapsedMs: Date.now() - start }); }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    if ((e.key === 'Enter' || e.key === ' ') && isInteractiveTarget(e)) return;
    if (e.key === 'Enter') { e.preventDefault(); ok(); }
    if (e.key === ' ' && onspeak) { e.preventDefault(); onspeak(promptSpeech({ type: 'intro' }, concept)); }
  }
</script>

<svelte:window onkeydown={onkey} />
<article class="card concept-card intro-layers" aria-label="Thẻ giới thiệu khái niệm">
  <p class="kicker">Khái niệm mới</p>
  <h2 class="term">{concept.term}
    {#if onspeak}<button class="speak" type="button" aria-label="Nghe định nghĩa" title="Nghe (Space)" onclick={() => onspeak?.(promptSpeech({ type: 'intro' }, concept))}><Glyph name="speaker" /></button>{/if}
  </h2>
  <MemoCard {concept} />
  {#if !concept.memo}<p class="plain">{layers.plain}</p>{/if}
  {#if quiz}
    <div class="intro-case">
      <p class="intro-case-q"><b>Thử nghĩ:</b> {quiz.q}</p>
      {#if reveal}<p class="intro-case-a" aria-live="polite"><b>Đáp:</b> {quiz.a}</p>
      {:else}<button class="btn ghost intro-case-btn" type="button" onclick={showAnswer}>Xem đáp</button>{/if}
    </div>
  {:else}
    <p class="intro-example"><b>Ví dụ:</b> {layers.example}</p>
  {/if}
  {#if concept.note && !open}<button class="intro-changed" type="button" aria-controls="intro-verbatim" onclick={() => (open = true)}><span aria-hidden="true">⚠</span> Luật đã thay đổi</button>{/if}
  <button class="btn ghost plain intro-toggle" type="button" aria-expanded={open} aria-controls="intro-verbatim" onclick={() => (open = !open)}>
    {open ? 'Ẩn nguyên văn điều luật' : 'Xem nguyên văn điều luật'}
  </button>
  {#if open}
    <div id="intro-verbatim">
      <blockquote class="quote">{layers.definition}</blockquote>
      {#if concept.note}<p class="note"><b>Cập nhật luật:</b> {concept.note}</p>{/if}
      <p class="source muted">Nguồn: {layers.source.cite}{#if layers.source.url} · <a href={layers.source.url} target="_blank" rel="noopener">Xem văn bản</a>{/if}</p>
      <LegalNote compact />
    </div>
  {/if}
  <button class="btn primary" type="button" onclick={ok}>Đã hiểu <kbd>↵</kbd></button>
</article>
