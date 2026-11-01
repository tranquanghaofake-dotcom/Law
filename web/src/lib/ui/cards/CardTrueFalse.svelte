<script lang="ts">
  import type { ItemTrueFalse } from '$lib/content/types';
  import { isTypingTarget, type CardProps } from './types';
  let { concept, item, onanswer }: CardProps<ItemTrueFalse> = $props();
  const start = Date.now();
  let chosen = $state<boolean | null>(null);
  function pick(v: boolean) {
    if (chosen !== null) return;
    chosen = v;
    onanswer({ correct: v === item.answer, elapsedMs: Date.now() - start, chosen: v ? 'Đúng' : 'Sai' });
  }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    if (e.key === '1') { e.preventDefault(); pick(true); }
    if (e.key === '2') { e.preventDefault(); pick(false); }
  }
  const cls = (v: boolean) => chosen === null ? '' : v === item.answer ? 'correct' : v === chosen ? 'wrong' : 'dim';
</script>

<svelte:window onkeydown={onkey} />
<article class="card question-card" aria-label="Nhận định đúng sai">
  <p class="kicker">Nhận định · {concept.term}</p>
  <p class="question">{item.statement}</p>
  <div class="options two" role="group" aria-label="Phương án">
    <button class="opt {cls(true)}" type="button" disabled={chosen !== null} aria-label="1. Đúng" onclick={() => pick(true)}><span class="key" aria-hidden="true">1</span><span>Đúng</span></button>
    <button class="opt {cls(false)}" type="button" disabled={chosen !== null} aria-label="2. Sai" onclick={() => pick(false)}><span class="key" aria-hidden="true">2</span><span>Sai</span></button>
  </div>
</article>
