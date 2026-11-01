<script lang="ts">
  // Kệ sách: mỗi môn một cuốn; ô trống vẽ khung "sắp có". size: 'side' (đáy sidebar) | 'large' (Hồ sơ).
  import BookSpine from '$lib/art/BookSpine.svelte';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { SHELF_MIN } from './shelf';
  let { size = 'side' }: { size?: 'side' | 'large' } = $props();
  if (!shelf.ready) refreshShelf();
  const dims = $derived(size === 'large' ? { w: 40, h: 132 } : { w: 26, h: 88 });
  const empties = $derived(Math.max(0, SHELF_MIN - shelf.books.length));
  const heights = [0.86, 0.94, 0.8, 0.9];
  const stateText = (b: (typeof shelf.books)[number]) => (b.state === 'done' ? 'đã thuần thục toàn bộ' : `thuần thục ${b.percent}% (${b.mastered}/${b.total} khái niệm)`);
</script>

<div class="shelf {size}">
  <ul class="shelf-row" aria-label="Kệ sách: mỗi môn một cuốn, hiện dần theo mức thuần thục">
    {#each shelf.books as b (b.id)}
      <li class="book {b.state}">
        <a href={b.href} aria-label="{b.title}: {stateText(b)}" title="{b.title} · {stateText(b)}">
          <BookSpine scheme={b.scheme} state={b.state} percent={b.percent} short={b.short} w={dims.w} h={dims.h} />
        </a>
        {#if size === 'large'}<span class="book-cap"><b>{b.short}</b><span>{b.state === 'done' ? 'Hoàn thành' : b.percent + '%'}</span></span>{/if}
      </li>
    {/each}
    {#each Array(empties) as _, i (i)}
      <li class="book slot" aria-hidden="true"><span class="slot-spine" style="width:{dims.w}px;height:{Math.round(dims.h * heights[i % heights.length])}px"></span>{#if size === 'large'}<span class="book-cap"><span>Sắp có</span></span>{/if}</li>
    {/each}
    <li class="bookend" aria-hidden="true">
      <svg class="art" viewBox="0 0 30 48" width={size === 'large' ? 36 : 24} height={size === 'large' ? 58 : 38}>
        <path class="f-acc k" d="M8 48h14l2-16q-9-4-18 0z" stroke-width="1.2" />
        <path class="ks" d="M8 38h14" stroke-width="1" />
        <path class="k" d="M15 32V14" stroke-width="1.2" />
        <path class="f-lotus k" d="M15 14c-7-2-10-8-8-14c3 2 6 6 8 11c2-5 5-9 8-11c2 6-1 12-8 14z" stroke-width="1" />
        <path class="f-leaf k" d="M15 26c-6-1-9 1-11 4c5 1 9 0 11-4z" stroke-width="1" />
      </svg>
    </li>
  </ul>
  <div class="plank" aria-hidden="true"></div>
</div>
