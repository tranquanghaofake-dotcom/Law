<script lang="ts">
  import type { ItemMcq } from '$lib/content/types';
  import { shuffle } from '$lib/engine/session';
  import { isTypingTarget, KEYS, type CardProps } from './types';
  let { concept, item, meta, rng, onanswer, kind = 'mcq' }: CardProps<ItemMcq> & { kind?: 'mcq' | 'case' } = $props();
  // Thẻ được remount theo từng bước (key), nên cố ý lấy giá trị ban đầu của item/rng.
  // svelte-ignore state_referenced_locally
  const start = Date.now();
  // svelte-ignore state_referenced_locally
  const order = shuffle(item.options.map((_, i) => i), rng);
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
    if (n >= 1 && n <= options.length) { e.preventDefault(); pick(n - 1); }
  }
  // Câu sinh tự động (định nghĩa → thuật ngữ, ví dụ → khái niệm): tên khái niệm là đáp án nên không được hiện ở kicker.
  // svelte-ignore state_referenced_locally
  const hideTerm = meta?.gen === 'def-term' || meta?.gen === 'example-concept';
  // svelte-ignore state_referenced_locally
  const kicker = hideTerm ? (meta?.kicker ?? 'Nhận biết') : meta?.kicker ? `${meta.kicker} · ${concept.term}` : `${kind === 'case' ? 'Tình huống' : 'Nhận biết'} · ${concept.term}`;
  const cls = (k: number) => chosen === null ? '' : k === answerIdx ? 'correct' : k === chosen ? 'wrong' : 'dim';
</script>

<svelte:window onkeydown={onkey} />
<article class="card question-card" aria-label={kind === 'case' ? 'Tình huống' : 'Trắc nghiệm'}>
  <p class="kicker">{kicker}</p>
  <p class="question">{item.q}</p>
  <div class="options" role="group" aria-label="Phương án">
    {#each options as o, k}
      <button class="opt {cls(k)}" type="button" disabled={chosen !== null} aria-label="{KEYS[k]}. {o}" onclick={() => pick(k)}>
        <span class="key" aria-hidden="true">{KEYS[k]}</span><span>{o}</span>
      </button>
    {/each}
  </div>
</article>
