<script lang="ts">
  // Tủ sách thật ở Hồ sơ: tủ gỗ 4–5 tầng, mỗi tầng 1–2 kệ nhóm ngành (biển tên nhỏ), mỗi môn một cuốn đại diện —
  // gáy màu kệ, cao theo số chương, dày theo số khái niệm, sáng dần theo tỉ lệ sách chương đã nhận, chấm vàng khi còn sách "cần ôn".
  // Chạm gáy → ngăn chi tiết (hộp thoại) với các cuốn chương (BookSpine cấp 0–3) + liên kết "Vào môn →".
  import BookSpine from '$lib/art/BookSpine.svelte';
  import { LEVEL_LABEL, type BookRec } from '$lib/game/books';
  import { shelf, refreshShelf } from './shelf.svelte';
  import { bookcaseRows, spineFont, type CaseBook } from './bookcase';
  import Sheet from './Sheet.svelte';

  if (!shelf.ready) refreshShelf();
  const rows = $derived(bookcaseRows(shelf.subjects, shelf.books));
  const earned = $derived(shelf.books.filter((b) => b.level > 0).length);
  const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI'];
  let selId = $state<string | null>(null);
  let open = $state(false);
  const sel = $derived<CaseBook | null>(rows.flatMap((r) => r.bays.flatMap((b) => b.books)).find((b) => b.id === selId) ?? null);
  const selBays = $derived(rows.flatMap((r) => r.bays).find((bay) => bay.books.some((b) => b.id === selId)) ?? null);
  const chapters = $derived<BookRec[]>(shelf.books.filter((b) => b.subject === selId));
  function pick(b: CaseBook) { selId = b.id; open = true; }
  const name = (b: CaseBook) => `${b.short}: ${b.title}, ${b.got}/${b.total} sách${b.needsReview ? ', cần ôn' : ''}`;
  const chapterName = (t: string) => t.replace(/^[^.:]*[.:]\s*/, '');
</script>

<div class="bk">
  <p class="muted small bk-lead">Mỗi môn một cuốn: <b>cao</b> theo số chương, <b>dày</b> theo số khái niệm, <b>sáng dần</b> khi nhận thêm sách chương. Chạm một gáy để mở ngăn chương.</p>
  <div class="bk-case">
    <div class="bk-cornice" aria-hidden="true"><span class="bk-lamp"></span></div>
    <div class="bk-body">
      {#each rows as r, ri (ri)}
        {@const tall = Math.max(...r.bays.flatMap((b) => b.books.map((x) => x.h)))}
        <div class="bk-tier" style="--tier-h:{tall + 8}px">
          {#each r.bays as bay (bay.shelfId)}
            <div class="bk-bay" style="flex-grow:{bay.width}">
              <ul class="bk-books" aria-label="Kệ {bay.name}">
                {#each bay.books as b (b.id)}
                  <li>
                    <button type="button" class="bk-spine" class:full={b.lit === 1} aria-haspopup="dialog" aria-label={name(b)} onclick={() => pick(b)}
                      style="--c:{b.color};--w:{b.w}px;--h:{b.h}px;--lit:{b.lit};--fs:{spineFont(b.short, b.h)}">
                      <span class="bk-name" aria-hidden="true">{b.short}</span>
                      <span class="bk-ribbon" aria-hidden="true"></span>
                      {#if b.needsReview}<span class="bk-dot" aria-hidden="true"></span>{/if}
                    </button>
                  </li>
                {/each}
              </ul>
              <p class="bk-plate"><span>{bay.name}</span></p>
            </div>
          {/each}
        </div>
      {/each}
    </div>
    <div class="bk-base" aria-hidden="true"></div>
  </div>
  <p class="small muted bk-count">{#if earned === 0}Chưa có sách chương nào · học hết 1 chương để nhận cuốn đầu tiên.{:else}{earned}/{shelf.books.length} sách chương đã nhận. Chấm vàng trên gáy = còn sách cần ôn lại.{/if}</p>
</div>

<Sheet bind:open title={sel?.title ?? ''} kicker={selBays ? `Kệ ${selBays.name}` : ''}>
  {#if sel}
    <p class="small muted bk-sum"><b>{sel.got}/{sel.total}</b> sách chương đã nhận · <b>{sel.level3}</b> cấp 3 · {sel.concepts} khái niệm{#if sel.needsReview} · <span class="bk-warn">có sách cần ôn lại</span>{/if}</p>
    <ul class="bk-chapters">
      {#each chapters as c (c.key)}
        <li class="bk-ch" class:ghost={c.level === 0}>
          <BookSpine scheme={sel.color} level={c.level} label={`${c.subjectShort} ${ROMAN[c.index] ?? c.index}`} w={30} h={104} review={c.needsReview} />
          <div>
            <p class="bk-ch-no small muted">Chương {c.index}</p>
            <p class="bk-ch-title">{chapterName(c.title)}</p>
            <p class="small bk-ch-lv" data-level={c.level}>{LEVEL_LABEL[c.level]}{#if c.needsReview} · <span class="bk-warn">cần ôn lại</span>{/if}</p>
          </div>
        </li>
      {/each}
    </ul>
    <a class="btn primary bk-go" href={sel.href} onclick={() => (open = false)}>Vào môn →</a>
  {/if}
</Sheet>
