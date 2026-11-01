<script lang="ts">
  import type { ItemPair } from '$lib/content/types';
  import { shuffle } from '$lib/engine/session';
  import { isTypingTarget, type CardProps } from './types';
  let { concept, item, rng, onanswer }: CardProps<ItemPair> = $props();
  // Thẻ được remount theo từng bước (key), nên cố ý lấy giá trị ban đầu của item/rng.
  // svelte-ignore state_referenced_locally
  const start = Date.now();
  // svelte-ignore state_referenced_locally
  const cases = shuffle(item.cases, rng);
  let i = $state(0);
  let marks = $state<boolean[]>([]);
  let last = $state<'left' | 'right' | null>(null);
  let finished = $state(false);

  function pick(side: 'left' | 'right') {
    if (finished || last !== null) return;
    last = side;
    const ok = cases[i].answer === side;
    marks = [...marks, ok];
    setTimeout(() => {
      last = null;
      if (i + 1 < cases.length) i += 1;
      else {
        finished = true;
        const wrong = marks.filter((m) => !m).length;
        onanswer({ correct: wrong === 0, elapsedMs: Math.round((Date.now() - start) / cases.length), chosen: `${marks.length - wrong}/${marks.length}` });
      }
    }, 450);
  }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    if (e.key === '1') { e.preventDefault(); pick('left'); }
    if (e.key === '2') { e.preventDefault(); pick('right'); }
  }
  const cls = (side: 'left' | 'right') => last === null ? '' : cases[i].answer === side ? 'correct' : side === last ? 'wrong' : 'dim';
</script>

<svelte:window onkeydown={onkey} />
<article class="card question-card" aria-label="Phân biệt">
  <p class="kicker">Phân biệt · {i + 1}/{cases.length}</p>
  <p class="question">{cases[i].text}</p>
  <div class="options two" role="group" aria-label="Chọn khái niệm đúng">
    <button class="opt {cls('left')}" type="button" disabled={last !== null || finished} aria-label="1. {item.left}" onclick={() => pick('left')}><span class="key" aria-hidden="true">1</span><span>{item.left}</span></button>
    <button class="opt {cls('right')}" type="button" disabled={last !== null || finished} aria-label="2. {item.right}" onclick={() => pick('right')}><span class="key" aria-hidden="true">2</span><span>{item.right}</span></button>
  </div>
  <p class="marks" aria-label="Kết quả từng tình huống">{#each marks as m}<span class={m ? 'ok' : 'bad'}>{m ? '●' : '○'}</span>{/each}</p>
</article>
