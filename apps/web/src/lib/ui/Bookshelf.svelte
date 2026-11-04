<script lang="ts">
  // Tủ sách theo chương. size 'side': kệ nhỏ đáy sidebar — 6 cuốn mới đạt gần nhất + tổng số sách; compact: một hàng gáy mảnh (8 cuốn) cho tủ gọn ở sidebar.
  // (Tủ nhiều tầng ở Hồ sơ nay là Bookcase.svelte.)
  import BookSpine from '$lib/art/BookSpine.svelte';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { schemeFor } from './shelf';
  import { coverFor } from '$lib/art/covers';
  import { spineColor } from './bookcase';
  import { LEVEL_LABEL, type BookRec } from '$lib/game/books';
  let { size = 'side', compact = false }: { size?: 'side'; compact?: boolean } = $props();
  if (!shelf.ready) refreshShelf();
  const earned = $derived(shelf.books.filter((b) => b.level > 0));
  const recent = $derived([...earned].sort((a, b) => (b.at ?? '').localeCompare(a.at ?? '') || b.level - a.level).slice(0, compact ? 8 : 6));
  const roman = (n: number) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'][n] ?? String(n);
  const tip = (b: BookRec) => `${b.title} · ${LEVEL_LABEL[b.level]}${b.needsReview ? ' · cần ôn lại' : ''}`;
  // màu gáy = màu thân bìa thật của môn (như Tủ sách ở Hồ sơ)
  const schemeOf = (b: BookRec) => spineColor(coverFor(b.subject, b.subjectTitle, schemeFor(b.subject, 0)).palette.body);
</script>

{#if size === 'side'}
  <div class="shelf side" class:compact>
    <ul class="shelf-row" aria-label="Sách đã nhận gần đây">
      {#each recent as b (b.key)}
        <li class="book lv{b.level}"><a href="#/mon/{b.subject}" title={tip(b)}><BookSpine scheme={schemeOf(b)} level={b.level} label={`${b.subjectShort} ${roman(b.index)}`} w={compact ? 15 : 24} h={compact ? 46 : 84} review={b.needsReview} /><span class="sr-only">{tip(b)}</span></a></li>
      {/each}
      {#each Array(Math.max(0, (compact ? 6 : 4) - recent.length)) as _, i (i)}<li class="book slot" aria-hidden="true"><span class="slot-spine" style="width:{compact ? 15 : 24}px;height:{(compact ? [38, 44, 36, 42, 40, 34] : [72, 80, 68, 76])[i]}px"></span></li>{/each}
      <li class="bookend" aria-hidden="true">
        <svg class="art" viewBox="0 0 30 48" width="24" height="38">
          <path class="f-acc k" d="M8 48h14l2-16q-9-4-18 0z" stroke-width="1.2" /><path class="ks" d="M8 38h14" stroke-width="1" />
          <path class="k" d="M15 32V14" stroke-width="1.2" /><path class="f-lotus k" d="M15 14c-7-2-10-8-8-14c3 2 6 6 8 11c2-5 5-9 8-11c2 6-1 12-8 14z" stroke-width="1" />
          <path class="f-leaf k" d="M15 26c-6-1-9 1-11 4c5 1 9 0 11-4z" stroke-width="1" />
        </svg>
      </li>
    </ul>
    <div class="plank" aria-hidden="true"></div>
    <p class="shelf-count small muted" class:sr-only={compact}>{#if earned.length === 0}Chưa có sách · học hết 1 chương để nhận{:else}{earned.length}/{shelf.books.length} sách{/if}</p>
  </div>
{/if}
