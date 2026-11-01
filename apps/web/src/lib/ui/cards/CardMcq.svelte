<script lang="ts">
  import type { ItemMcq } from '$lib/content/types';
  import { shuffle } from '$lib/engine/session';
  import { isTypingTarget, KEYS, type CardProps } from './types';
  let { concept, item, rng, onanswer, kind = 'mcq' }: CardProps<ItemMcq> & { kind?: 'mcq' | 'case' } = $props();
  // Thẻ được remount theo từng bước (key), nên cố ý lấy giá trị ban đầu của item/rng.
  // svelte-ignore state_referenced_locally
  const start = Date.now();
  // svelte-ignore state_referenced_locally
  const order = shuffle([0, 1, 2, 3], rng);
  // svelte-ignore state_referenced_locally
  const options = order.map((i) => item.options[i]);
  // svelte-ignore state_referenced_locally
  const answerIdx = order.indexOf(item.answer);
  let chosen = $state<number | null>(null);

  function pick(k: number) {
    if (chosen !== null) return;
    chosen = k;
    onanswer({ correct: k === answerIdx, elapsedMs: Date.now() - start, chosen: options[k] });
  }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e)) return;
    const n = Number(e.key);
    if (n >= 1 && n <= 4) { e.preventDefault(); pick(n - 1); }
  }
  const cls = (k: number) => chosen === null ? '' : k === answerIdx ? 'correct' : k === chosen ? 'wrong' : 'dim';
</script>

<svelte:window onkeydown={onkey} />
<article class="card question-card" aria-label={kind === 'case' ? 'Tình huống' : 'Trắc nghiệm'}>
  <p class="kicker">{kind === 'case' ? 'Tình huống' : 'Nhận biết'} · {concept.term}</p>
  <p class="question">{item.q}</p>
  <div class="options" role="group" aria-label="Phương án">
    {#each options as o, k}
      <button class="opt {cls(k)}" type="button" disabled={chosen !== null} aria-label="{KEYS[k]}. {o}" onclick={() => pick(k)}>
        <span class="key" aria-hidden="true">{KEYS[k]}</span><span>{o}</span>
      </button>
    {/each}
  </div>
</article>
