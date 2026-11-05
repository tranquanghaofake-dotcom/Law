<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { Concept } from '$lib/content/types';
  import type { StepItem } from '$lib/engine/session';
  import type { AnswerResult } from './cards/types';
  import { isInteractiveTarget, isTypingTarget } from './cards/types';
  import { answerText } from './cards/answer';
  import { feedbackSpeech } from './session/speech';
  import { LEVEL_NAMES } from '$lib/game/levels';
  import WhyPanel from './WhyPanel.svelte';
  import LegalNote from './LegalNote.svelte';
  import MemoCard from './MemoCard.svelte';
  import CompareTable from './CompareTable.svelte';
  let { result, item, concept, confusableTerms = [], confusables = [], compareWith = null, onnext, onspeak, last = false, xp = 0, golden = false, levelTo = null, retry = false }: {
    result: AnswerResult; item: StepItem; concept: Concept; confusableTerms?: string[];
    /** (đợt 7) khái niệm dễ nhầm có trong phiên (để dựng "vì sao") và khái niệm để so sánh sau câu Phân biệt */
    confusables?: Concept[]; compareWith?: Concept | null;
    onnext: () => void; onspeak?: (t: string) => void; last?: boolean;
    /** XP vừa nhận (0 = không hiện), câu vàng, bậc mới của khái niệm nếu vừa lên bậc, vòng sửa sai */
    xp?: number; golden?: boolean; levelTo?: number | null; retry?: boolean;
  } = $props();

  const correctText = $derived(item.type === 'pair' || item.type === 'sort' || item.type === 'match' || item.type === 'recall' ? '' : answerText(item));
  const explain = $derived(item.type === 'recall' ? item.model : 'explain' in item ? item.explain : '');
  const source = $derived(('source' in item && item.source) ? item.source : concept.source);
  const speakText = $derived(feedbackSpeech(item, result));

  function focusOnMount(node: HTMLElement) { node.focus({ preventScroll: true }); }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    // Nút Câu tiếp được focus tự động: Space vẫn là phím Nghe như title của nút loa; Enter kích hoạt nút gốc.
    const onNextBtn = (e.target as HTMLElement | null)?.hasAttribute?.('data-next') ?? false;
    if (e.key === ' ' && onNextBtn && onspeak) { e.preventDefault(); onspeak(speakText); return; }
    if ((e.key === 'Enter' || e.key === ' ') && isInteractiveTarget(e)) return;
    if (e.key === 'Enter') { e.preventDefault(); onnext(); }
    if (e.key === ' ' && onspeak) { e.preventDefault(); onspeak(speakText); }
  }
</script>

<svelte:window onkeydown={onkey} />
<div class="feedback {result.correct ? 'ok' : 'bad'}" role="status" aria-live="polite">
  {#if result.correct}<span class="ok-seal" aria-hidden="true">ĐÚNG</span>{/if}
  <p class="verdict"><span class="vtext">{result.correct ? 'Chính xác.' : `Chưa đúng.${correctText ? ` Đáp án: ${correctText}` : ''}`}</span>
    {#if xp > 0}<span class="chip xp-chip" class:gold={golden}>+{xp} XP{golden ? ' · câu vàng' : ''}</span>{/if}
    {#if levelTo !== null}<span class="chip level-chip">Lên bậc {levelTo}<small> · {LEVEL_NAMES[levelTo]}</small></span>{/if}
    {#if onspeak}<button class="speak" type="button" aria-label="Nghe giải thích" title="Nghe (Space)" onclick={() => onspeak?.(speakText)}><Glyph name="speaker" /></button>{/if}
  </p>
  <WhyPanel {concept} {item} correct={result.correct} {explain} chosen={result.chosen} {confusables} />
  {#if item.type !== 'intro'}<MemoCard {concept} {item} />{/if}
  {#if compareWith}<details class="cmp-wrap" open={!result.correct}><summary>So sánh «{concept.term}» và «{compareWith.term}»</summary><CompareTable a={concept} b={compareWith} /></details>{/if}
  {#if retry}<p class="muted small">Vòng sửa sai: câu này không ghi vào tiến độ nhớ, chỉ để bạn gỡ lại.</p>{/if}
  <details class="fb-source small"><summary><span aria-hidden="true">ⓘ</span> Nguồn</summary>
    <p class="source muted">{source.cite}{#if source.url} · <a href={source.url} target="_blank" rel="noopener">Xem văn bản</a>{/if}</p>
    <LegalNote compact />
  </details>
  {#if !result.correct && confusableTerms.length && !confusables.length}<p class="muted">Dễ nhầm với: <b>{confusableTerms.join(', ')}</b></p>{/if}
  <button class="btn" type="button" data-next onclick={onnext} use:focusOnMount>{last ? 'Xem kết quả' : 'Câu tiếp →'} <kbd>↵</kbd></button>
</div>
