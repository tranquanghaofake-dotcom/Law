<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  import type { ItemRecall } from '$lib/content/types';
  import { gradeChecklist, gradeRecall, normalize } from '$lib/engine/grading';
  import type { CardProps } from './types';
  let { concept, item, meta, onanswer, onspeak }: CardProps<ItemRecall> = $props();
  const start = Date.now();
  let text = $state('');
  let revealed = $state(false);
  let thinkMs = 0; // thời gian viết bài, tính tới lúc Xem đáp án (không tính lúc đọc đáp án và tự chấm)
  let graded = $state(false);
  const grade = $derived(gradeRecall(text, item.keywords));

  /** Tách bài viết thành đoạn thường / đoạn trúng từ khóa để tô <mark>. */
  function segments(t: string, hits: string[]): { s: string; hit: boolean }[] {
    if (!hits.length || !t) return [{ s: t, hit: false }];
    const re = new RegExp(hits.map((h) => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'giu');
    const out: { s: string; hit: boolean }[] = [];
    let last = 0;
    for (const m of t.normalize('NFC').matchAll(re)) {
      if (m.index! > last) out.push({ s: t.slice(last, m.index), hit: false });
      out.push({ s: m[0], hit: true });
      last = m.index! + m[0].length;
    }
    if (last < t.length) out.push({ s: t.slice(last), hit: false });
    return out;
  }
  // từ khóa trúng theo normalize nhưng tô theo nguyên văn: so khớp không phân biệt hoa thường
  const hitSegments = $derived(segments(text, grade.hits.filter((h) => normalize(text).includes(normalize(h)))));

  // Tự chấm từng ý: ô tick đặt sẵn theo từ khóa máy tìm thấy trong bài, người học sửa lại cho đúng ý mình viết
  let ticked = $state<boolean[]>([]);
  const verdict = $derived(gradeChecklist(ticked));
  const VERDICT_TEXT = { dung: 'Đủ ý', gan: 'Gần đủ ý', sai: 'Thiếu nhiều ý' } as const;
  function reveal() { thinkMs = Date.now() - start; ticked = item.keywords.map((k) => grade.hits.includes(k)); revealed = true; }
  function self() {
    if (graded) return;
    const g = verdict;
    graded = true;
    onanswer({ correct: g !== 'sai', elapsedMs: thinkMs, selfGrade: g, chosen: text });
  }
</script>

<article class="card question-card recall" aria-label="Tự trả lời">
  <p class="kicker">{meta?.kicker ?? `Tự trả lời · ${concept.term}`}</p>
  <p class="question">{item.q}</p>
  {#if !revealed}
    <textarea rows="4" placeholder="Viết 1–3 câu bằng lời của bạn…" aria-label="Bài trả lời" bind:value={text}></textarea>
    <button class="btn primary" type="button" disabled={!text.trim()} onclick={reveal}>Xem đáp án</button>
  {:else}
    <div class="your-answer"><p class="kicker">Bài của bạn</p><p>{#each hitSegments as seg}{#if seg.hit}<mark>{seg.s}</mark>{:else}{seg.s}{/if}{/each}</p></div>
    <div class="model"><p class="kicker">Đáp án mẫu {#if onspeak}<button class="speak" type="button" aria-label="Nghe đáp án" onclick={() => onspeak?.(item.model)}><Glyph name="speaker" /></button>{/if}</p><p class="quote">{item.model}</p>
      <p class="muted">Từ khóa: {#each item.keywords as k, i}<span class={grade.hits.includes(k) ? 'kw ok' : 'kw bad'}>{k}</span>{i < item.keywords.length - 1 ? ' · ' : ''}{/each}</p></div>
    <fieldset class="recall-check" disabled={graded}>
      <legend class="kicker">Bài của bạn có đủ các ý này không?</legend>
      {#each item.keywords as k, i (k)}
        <label class="rc-row"><input type="checkbox" bind:checked={ticked[i]} /><span>{k}</span></label>
      {/each}
    </fieldset>
    <button class="btn primary" type="button" disabled={graded} onclick={self}>Chốt: {VERDICT_TEXT[verdict]} ({ticked.filter(Boolean).length}/{item.keywords.length})</button>
  {/if}
</article>
