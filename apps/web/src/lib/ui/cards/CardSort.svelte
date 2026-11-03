<script lang="ts">
  // Xếp tình huống vào hai cột: hiện từng tình huống, chọn cột bằng chạm / phím 1–2 / kéo thả (Pointer Events).
  // Đặt sai: tình huống rơi vào cột đúng và được đánh dấu sai. Tính đúng khi không sai tình huống nào.
  import { onDestroy } from 'svelte';
  import { shuffle } from '$lib/engine/session';
  import type { SortItem } from '$lib/engine/session';
  import { sfx } from '$lib/fx/sfx';
  import { buzz } from '$lib/fx/haptics';
  import { isTypingTarget, type CardProps } from './types';
  import { place, sideAt, sortCorrect, sortWrongs, type Placed } from '$lib/ui/session/sortGame';
  let { item, meta, rng, onanswer }: CardProps<SortItem> = $props();
  // svelte-ignore state_referenced_locally
  const start = Date.now();
  // svelte-ignore state_referenced_locally
  const cases = shuffle(item.cases, rng);
  let placed = $state<Placed[]>([]);
  let busy = $state(false);
  let lastOk = $state<boolean | null>(null);
  let drag = $state<{ x: number; y: number; over: 'left' | 'right' | null } | null>(null);
  let timer: ReturnType<typeof setTimeout> | undefined;
  onDestroy(() => clearTimeout(timer));
  const cur = $derived(placed.length < cases.length ? cases[placed.length] : null);

  // Kết quả vừa chọn: hiện trên thẻ + tô cột, rồi mới đưa thẻ vào danh sách của cột (tránh hiện trùng).
  let verdict = $state<{ pick: 'left' | 'right'; ok: boolean } | null>(null);
  function pick(side: 'left' | 'right') {
    if (busy || !cur) return;
    const r = place(cases, placed, side);
    if (!r) return;
    lastOk = r.ok; busy = true; verdict = { pick: side, ok: r.ok };
    sfx.play(r.ok ? 'select' : 'wrong'); buzz(r.ok ? 'ok' : 'bad');
    timer = setTimeout(() => {
      placed = r.placed; busy = false; lastOk = null; verdict = null;
      if (r.done) onanswer({ correct: sortCorrect(placed), elapsedMs: Math.round((Date.now() - start) / cases.length), chosen: `${cases.length - sortWrongs(placed)}/${cases.length}` });
    }, r.ok ? 380 : 800);
  }
  function onkey(e: KeyboardEvent) {
    if (isTypingTarget(e) || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === '1') { e.preventDefault(); pick('left'); }
    if (e.key === '2') { e.preventDefault(); pick('right'); }
  }

  // Kéo thả: thẻ tình huống theo con trỏ; thả lên cột nào (phần tử có data-side) thì xếp vào cột đó.
  // Chạm đơn (không kéo đủ xa) không làm gì, người dùng bấm nút cột như thường.
  let origin: { x: number; y: number; id: number } | null = null;
  function down(e: PointerEvent) {
    if (busy || !cur || (e.pointerType === 'mouse' && e.button !== 0)) return;
    origin = { x: e.clientX, y: e.clientY, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  }
  function move(e: PointerEvent) {
    if (!origin || e.pointerId !== origin.id) return;
    const dx = e.clientX - origin.x, dy = e.clientY - origin.y;
    if (!drag && Math.hypot(dx, dy) < 8) return;
    // mọi phần tử xếp chồng dưới con trỏ (kể cả chính thẻ đang kéo, được pointer capture giữ)
    const els = document.elementsFromPoint?.(e.clientX, e.clientY) ?? [];
    const over = els.map((el) => sideAt(el)).find((v) => v) ?? null;
    drag = { x: dx, y: dy, over };
  }
  function up(e: PointerEvent) {
    if (!origin || e.pointerId !== origin.id) return;
    const side = drag?.over ?? null;
    origin = null; drag = null;
    if (side) pick(side);
  }
  function cancel() { origin = null; drag = null; }
</script>

<svelte:window onkeydown={onkey} />
<article class="card question-card sort-card" aria-label="Xếp tình huống">
  <p class="kicker">{meta?.kicker ?? 'Phân biệt'} · {Math.min(placed.length + 1, cases.length)}/{cases.length}</p>
  <p class="question">Tình huống này thuộc cột nào?</p>
  <div class="sort-stage">
    {#if cur}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="sort-case {lastOk === null ? '' : lastOk ? 'ok' : 'bad'}" class:dragging={!!drag} style={drag ? `transform:translate(${drag.x}px,${drag.y}px) rotate(${Math.max(-6, Math.min(6, drag.x / 30))}deg)` : ''}
        onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={cancel} aria-live="polite">
        {cur.text}
      </div>
    {/if}
  </div>
  <div class="sort-cols">
    {#each [['left', item.left, '1'], ['right', item.right, '2']] as [side, label, key] (side)}
      {@const s = side as 'left' | 'right'}
      <div class="sort-col" class:over={drag?.over === s} class:hit={!!verdict && cur?.answer === s} class:miss={!!verdict && !verdict.ok && verdict.pick === s} data-side={s}>
        <button class="opt sort-pick" type="button" disabled={busy || !cur} aria-label="{key}. {label}" onclick={() => pick(s)}><span class="key" aria-hidden="true">{key}</span><span>{label}</span></button>
        <ul class="sort-list" aria-label="Đã xếp vào {label}">
          {#each placed.filter((p) => p.side === s) as p (p.index)}
            <li class={p.ok ? 'ok' : 'bad'}><span class="sr-only">{p.ok ? 'Đúng: ' : 'Xếp sai: '}</span>{cases[p.index].text}</li>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
  <p class="muted small sort-hint">Chạm tên cột, bấm phím 1–2 hoặc kéo thẻ sang cột.</p>
</article>
