<script lang="ts">
  // Tủ sách theo chương. size 'side': kệ nhỏ đáy sidebar — 6 cuốn mới đạt gần nhất + tổng số sách.
  // size 'large': tủ nhiều tầng ở Hồ sơ — mỗi tầng một môn, mỗi chương một gáy (chưa đạt = khung nét đứt).
  import BookSpine from '$lib/art/BookSpine.svelte';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { schemeFor } from './shelf';
  import { LEVEL_LABEL, type BookRec } from '$lib/game/books';
  let { size = 'side' }: { size?: 'side' | 'large' } = $props();
  if (!shelf.ready) refreshShelf();
  const earned = $derived(shelf.books.filter((b) => b.level > 0));
  const recent = $derived([...earned].sort((a, b) => (b.at ?? '').localeCompare(a.at ?? '') || b.level - a.level).slice(0, 6));
  const rows = $derived(shelf.subjects.map((s, i) => ({ s, scheme: schemeFor(s.id, i), books: shelf.books.filter((b) => b.subject === s.id) })));
  const roman = (n: number) => ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'][n] ?? String(n);
  const tip = (b: BookRec) => `${b.title} · ${LEVEL_LABEL[b.level]}${b.needsReview ? ' · cần ôn lại' : ''}`;
  const schemeOf = (id: string) => rows.find((r) => r.s.id === id)?.scheme ?? 'xanh';
</script>

{#if size === 'side'}
  <div class="shelf side">
    <ul class="shelf-row" aria-label="Sách đã nhận gần đây">
      {#each recent as b (b.key)}
        <li class="book lv{b.level}"><a href="#/mon/{b.subject}" aria-label={tip(b)} title={tip(b)}><BookSpine scheme={schemeOf(b.subject)} level={b.level} label={`${b.subjectShort} ${roman(b.index)}`} w={24} h={84} review={b.needsReview} /></a></li>
      {/each}
      {#each Array(Math.max(0, 4 - recent.length)) as _, i (i)}<li class="book slot" aria-hidden="true"><span class="slot-spine" style="width:24px;height:{[72, 80, 68, 76][i]}px"></span></li>{/each}
      <li class="bookend" aria-hidden="true">
        <svg class="art" viewBox="0 0 30 48" width="24" height="38">
          <path class="f-acc k" d="M8 48h14l2-16q-9-4-18 0z" stroke-width="1.2" /><path class="ks" d="M8 38h14" stroke-width="1" />
          <path class="k" d="M15 32V14" stroke-width="1.2" /><path class="f-lotus k" d="M15 14c-7-2-10-8-8-14c3 2 6 6 8 11c2-5 5-9 8-11c2 6-1 12-8 14z" stroke-width="1" />
          <path class="f-leaf k" d="M15 26c-6-1-9 1-11 4c5 1 9 0 11-4z" stroke-width="1" />
        </svg>
      </li>
    </ul>
    <div class="plank" aria-hidden="true"></div>
    <p class="shelf-count small muted">{earned.length}/{shelf.books.length} sách</p>
  </div>
{:else}
  <div class="bookcase">
    {#each rows as r (r.s.id)}
      {@const got = r.books.filter((b) => b.level > 0).length}
      <section class="case-row">
        <p class="case-label"><b>{r.s.title}</b> <span class="muted small">{got}/{r.books.length} sách · cấp 3: {r.books.filter((b) => b.level === 3).length}</span></p>
        <div class="shelf large">
          <ul class="shelf-row" aria-label="Sách môn {r.s.title}">
            {#each r.books as b (b.key)}
              <li class="book lv{b.level}" class:ghost={b.level === 0}><a href="#/mon/{b.subject}" aria-label={tip(b)} title={tip(b)}><BookSpine scheme={r.scheme} level={b.level} label={`${roman(b.index)} · ${b.title.replace(/^[^.:]*[.:]\s*/, '')}`} w={30} h={112} review={b.needsReview} /></a></li>
            {/each}
          </ul>
          <div class="plank" aria-hidden="true"></div>
        </div>
      </section>
    {/each}
    <p class="small muted legend-books">Cấp 1: mọi khái niệm của chương ≥ bậc 3 · Cấp 2: ≥ bậc 5 · Cấp 3: tất cả bậc 6. Sách giữ cấp đã đạt; chấm vàng = cần ôn lại.</p>
  </div>
{/if}
