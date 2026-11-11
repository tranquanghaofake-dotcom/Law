<script lang="ts">
  // Thẻ nhận định. Có `item.parts` thì chấm 3 phần (spec 2026-11-07-nhan-dinh-3-phan): Đúng/Sai → căn cứ → lập luận,
  // chỉ báo kết quả sau bước 3 (0,25 · 0,25 · 0,5). Không có `parts` thì một bước như cũ.
  import type { ItemTrueFalse } from '$lib/content/types';
  import { scoreNhanDinh } from '$lib/engine/grading';
  import { isTypingTarget, type CardProps } from './types';
  let { concept, item, meta, onanswer }: CardProps<ItemTrueFalse> = $props();
  const start = Date.now();
  let chosen = $state<boolean | null>(null);
  let basis = $state<number | null>(null);
  let reason = $state<number | null>(null);
  const three = $derived(!!item.parts);
  const step = $derived(chosen === null ? 1 : !three ? 0 : basis === null ? 2 : reason === null ? 3 : 0);
  const result = $derived(item.parts && chosen !== null && basis !== null && reason !== null ? scoreNhanDinh({ answer: item.answer, parts: item.parts }, { tf: chosen, basis, reason }) : null);
  const fmt = (n: number) => String(n).replace('.', ',');

  function pick(v: boolean) {
    if (chosen !== null) return;
    chosen = v;
    if (!item.parts) onanswer({ correct: v === item.answer, elapsedMs: Date.now() - start, chosen: v ? 'Đúng' : 'Sai' });
  }
  function pickPart(k: number) {
    if (!item.parts) return;
    if (step === 2) { basis = k; return; }
    if (step !== 3) return;
    reason = k;
    const r = scoreNhanDinh({ answer: item.answer, parts: item.parts }, { tf: chosen!, basis: basis!, reason: k });
    onanswer({ correct: r.correct, elapsedMs: Date.now() - start, chosen: `${chosen ? 'Đúng' : 'Sai'} · ${item.parts.basis.options[basis!]} · ${item.parts.reason.options[k]}`, selfGrade: r.grade });
  }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    const n = Number(e.key);
    if (step === 1 && (n === 1 || n === 2)) { e.preventDefault(); pick(n === 1); }
    else if ((step === 2 || step === 3) && n >= 1 && n <= 4) { e.preventDefault(); pickPart(n - 1); }
  }
  const cls = (v: boolean) => chosen === null || (three && step !== 0) ? (chosen === v ? 'picked' : '') : v === item.answer ? 'correct' : v === chosen ? 'wrong' : 'dim';
  const pcls = (picked: number | null, ans: number, k: number) => step !== 0 ? (picked === k ? 'picked' : '') : k === ans ? 'correct' : k === picked ? 'wrong' : 'dim';
</script>

<svelte:window onkeydown={onkey} />
<article class="card question-card" aria-label="Nhận định đúng sai">
  <p class="kicker">{meta?.kicker ?? `Nhận định · ${concept.term}`}{#if three}{' · chấm 3 phần'}{/if}</p>
  <p class="question">{item.statement}</p>
  {#if three}<p class="nd-step small muted">Bước 1/3 · Đúng hay sai? <span class="nd-pt">(0,25 điểm)</span></p>{/if}
  <div class="options two" role="group" aria-label="Phương án">
    <button class="opt {cls(true)}" type="button" disabled={chosen !== null} aria-label="1. Đúng" onclick={() => pick(true)}><span class="key" aria-hidden="true">1</span><span>Đúng</span></button>
    <button class="opt {cls(false)}" type="button" disabled={chosen !== null} aria-label="2. Sai" onclick={() => pick(false)}><span class="key" aria-hidden="true">2</span><span>Sai</span></button>
  </div>
  {#if item.parts && chosen !== null}
    <p class="nd-step small muted">Bước 2/3 · Căn cứ pháp lý <span class="nd-pt">(0,25 điểm)</span></p>
    <div class="options" role="group" aria-label="Căn cứ pháp lý">
      {#each item.parts.basis.options as o, k (k)}
        <button class="opt {pcls(basis, item.parts.basis.answer, k)}" type="button" disabled={step !== 2} onclick={() => pickPart(k)}><span class="key" aria-hidden="true">{k + 1}</span><span>{o}</span></button>
      {/each}
    </div>
  {/if}
  {#if item.parts && basis !== null}
    <p class="nd-step small muted">Bước 3/3 · Lập luận <span class="nd-pt">(0,5 điểm)</span></p>
    <div class="options" role="group" aria-label="Lập luận">
      {#each item.parts.reason.options as o, k (k)}
        <button class="opt {pcls(reason, item.parts.reason.answer, k)}" type="button" disabled={step !== 3} onclick={() => pickPart(k)}><span class="key" aria-hidden="true">{k + 1}</span><span>{o}</span></button>
      {/each}
    </div>
  {/if}
  {#if result}
    <p class="nd-score" role="status"><b>Điểm: {fmt(result.score)}/1</b> · Đúng/Sai {result.parts.tf ? '✓' : '✗'} · Căn cứ {result.parts.basis ? '✓' : '✗'} · Lập luận {result.parts.reason ? '✓' : '✗'}</p>
  {/if}
</article>

<style>
  .nd-step { margin: var(--sp-3) 0 var(--sp-2); }
  .nd-pt { white-space: nowrap; }
  .nd-score { margin: var(--sp-3) 0 0; padding: var(--sp-2) var(--sp-3); border-radius: var(--r-sm, 8px); background: color-mix(in srgb, var(--accent) 10%, var(--paper)); }
  :global(.opt.picked) { border-color: var(--accent-line); background: color-mix(in srgb, var(--accent) 12%, var(--paper)); }
</style>
