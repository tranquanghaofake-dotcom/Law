<script lang="ts">
  // Ghép cặp nhanh kiểu chạm–chạm: chạm một thuật ngữ rồi một mô tả (hoặc ngược lại).
  // Đúng → khoá cặp; sai → rung nhẹ. Tính đúng khi không ghép sai quá 1 lần (MATCH_MAX_WRONGS).
  import { onDestroy } from 'svelte';
  import { shuffle } from '$lib/engine/session';
  import type { MatchItem } from '$lib/engine/session';
  import { sfx } from '$lib/fx/sfx';
  import { buzz } from '$lib/fx/haptics';
  import { isTypingTarget, KEYS, type CardProps } from './types';
  import { createMatch, firstTry, isComplete, matchCorrect, tap, type Side } from '$lib/ui/session/matchGame';
  let { item, meta, rng, onanswer }: CardProps<MatchItem> = $props();
  // Thẻ được remount theo từng bước (key), nên cố ý lấy giá trị ban đầu của item/rng.
  // svelte-ignore state_referenced_locally
  const start = Date.now();
  // svelte-ignore state_referenced_locally
  const terms = shuffle(item.pairs.map((_, i) => i), rng);
  // svelte-ignore state_referenced_locally
  const descs = shuffle(item.pairs.map((_, i) => i), rng);
  // svelte-ignore state_referenced_locally
  let st = $state(createMatch(item.pairs.length));
  let flash = $state<{ term: number; desc: number } | null>(null);
  let finished = $state(false);
  let timers: ReturnType<typeof setTimeout>[] = [];
  onDestroy(() => timers.forEach(clearTimeout));

  function press(side: Side, idx: number) {
    if (finished || flash) return;
    const r = tap(st, side, idx);
    st = r.state;
    if (r.outcome === 'select') sfx.play('select');
    else if (r.outcome === 'ok') {
      sfx.play('correct', { combo: st.done.filter(Boolean).length });
      buzz('ok');
      if (isComplete(st)) {
        finished = true;
        timers.push(setTimeout(() => onanswer({ correct: matchCorrect(st), elapsedMs: Math.round((Date.now() - start) / item.pairs.length), chosen: `${firstTry(st)}/${item.pairs.length}` }), 600));
      }
    } else if (r.outcome === 'bad') {
      sfx.play('wrong'); buzz('bad');
      flash = { term: r.term!, desc: r.desc! };
      timers.push(setTimeout(() => (flash = null), 420));
    }
  }
  // Phím: 1–4 chọn thuật ngữ theo thứ tự trên màn hình, A–D chọn mô tả.
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    const n = Number(e.key);
    if (n >= 1 && n <= terms.length) { e.preventDefault(); press('term', terms[n - 1]); return; }
    const k = KEYS.indexOf(e.key.toUpperCase() as (typeof KEYS)[number]);
    if (k >= 0 && k < descs.length) { e.preventDefault(); press('desc', descs[k]); }
  }
  const cls = (side: Side, idx: number) => st.done[idx] ? 'locked' : st.sel[side] === idx ? 'sel' : flash && flash[side] === idx ? 'wrong' : '';
  const left = $derived(st.done.filter(Boolean).length);
</script>

<svelte:window onkeydown={onkey} />
<article class="card question-card match-card" aria-label="Ghép cặp">
  <p class="kicker">{meta?.kicker ?? 'Ghép cặp nhanh'} · {left}/{item.pairs.length} cặp</p>
  <p class="question">Chạm một thuật ngữ rồi chạm mô tả khớp với nó.</p>
  <div class="match-grid">
    <div class="match-col" role="group" aria-label="Thuật ngữ">
      {#each terms as t, n (t)}
        <button class="opt match-cell {cls('term', t)}" type="button" disabled={st.done[t] || finished} aria-pressed={st.sel.term === t} onclick={() => press('term', t)}>
          <span class="key" aria-hidden="true">{n + 1}</span><span>{item.pairs[t].term}</span>
        </button>
      {/each}
    </div>
    <div class="match-col" role="group" aria-label="Mô tả">
      {#each descs as d, n (d)}
        <button class="opt match-cell desc {cls('desc', d)}" type="button" disabled={st.done[d] || finished} aria-pressed={st.sel.desc === d} onclick={() => press('desc', d)}>
          <span class="key" aria-hidden="true">{KEYS[n]}</span><span>{item.pairs[d].text}</span>
        </button>
      {/each}
    </div>
  </div>
  <p class="marks muted small" role="status">{st.wrongs === 0 ? 'Được ghép sai tối đa 1 lần.' : st.wrongs === 1 ? 'Đã ghép sai 1 lần — sai thêm sẽ tính là chưa đúng.' : `Đã ghép sai ${st.wrongs} lần — câu này tính là chưa đúng.`}</p>
</article>
