<script lang="ts">
  // Hộp tìm toàn cục (spec 2026-11-11): một ô tìm cho khái niệm của mọi môn, môn học và bộ đề.
  // <dialog> modal gốc của trình duyệt (giữ focus, Esc đóng); neo phía trên màn hình để bàn phím ảo không che kết quả.
  import { tick } from 'svelte';
  import Glyph from '$lib/art/Glyph.svelte';
  import { loadIndex, loadTermIndex } from '$lib/content/loader';
  import { hashFor } from '$lib/router.svelte';
  import { GROUPS } from './groups';
  import { EMPTY, searchAll, type SearchSource } from './globalSearch';

  let { open = $bindable(false) }: { open?: boolean } = $props();
  let dlg = $state<HTMLDialogElement | null>(null);
  let input = $state<HTMLInputElement | null>(null);
  let query = $state('');
  let src = $state<SearchSource | null>(null);
  let failed = $state(false);
  const typed = $derived(query.trim().length >= 2);
  const res = $derived(src && typed ? searchAll(query, src) : EMPTY);
  const more = $derived(res.conceptTotal - res.concepts.length);
  // Đọc cho trình đọc màn hình mỗi khi kết quả đổi.
  const status = $derived(
    !src || !typed ? '' : res.total ? `${res.conceptTotal} khái niệm, ${res.subjects.length} môn học, ${res.sets.length} bộ đề` : `Không thấy kết quả cho ${query.trim()}`,
  );

  // Bảng tên của mọi môn + danh sách môn, bộ đề: tải khi mở lần đầu (loader tự nhớ, lần sau không tải lại).
  async function load() {
    failed = false;
    try {
      const [ix, terms] = await Promise.all([loadIndex(), loadTermIndex()]);
      src = {
        terms,
        subjects: ix.subjects.filter((s) => (ix.conceptCount[s.id] ?? 0) > 0),
        sets: ix.sets.map(({ id, title, subtitle, group }) => ({ id, title, subtitle, group })),
      };
    } catch { failed = true; }
  }

  $effect(() => {
    if (!dlg) return;
    if (open && !dlg.open) {
      // jsdom (test) chưa có showModal: rơi về thuộc tính open
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
      void tick().then(() => input?.focus());
    } else if (!open && dlg.open) {
      if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    }
  });
  $effect(() => { if (open && !src && !failed) void load(); });

  function close() { open = false; query = ''; }
  // chạm vào nền tối (chính phần tử <dialog>, ngoài thẻ nội dung) thì đóng
  function backdrop(e: MouseEvent) { if (e.target === dlg) close(); }
  // ↓/↑ chuyển giữa các dòng kết quả (↑ ở dòng đầu về ô nhập); Enter trong ô nhập mở kết quả đầu tiên.
  function keys(e: KeyboardEvent) {
    const enter = e.key === 'Enter' && e.target === input;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && !enter) return;
    const hits = dlg ? [...dlg.querySelectorAll<HTMLAnchorElement>('a.sr-hit')] : [];
    if (!hits.length) return;
    e.preventDefault();
    if (enter) { hits[0].click(); return; }
    const next = hits.indexOf(document.activeElement as HTMLAnchorElement) + (e.key === 'ArrowDown' ? 1 : -1);
    if (next < 0) input?.focus(); else hits[Math.min(next, hits.length - 1)].focus();
  }
</script>

<!-- Đổi trang (bấm kết quả, nút lùi của trình duyệt) thì hộp tự đóng. -->
<svelte:window onhashchange={close} />

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dlg} class="search-dlg" aria-label="Tìm kiếm" onclose={close} onclick={backdrop} onkeydown={keys}>
  {#if open}
    <div class="search-card">
      <div class="search-top">
        <label class="search-field">
          <Glyph name="search" size={18} />
          <span class="sr-only">Tìm khái niệm, môn học, bộ đề</span>
          <input bind:this={input} bind:value={query} type="search" placeholder="Tìm khái niệm, môn, bộ đề" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search" />
        </label>
        <button type="button" class="sheet-x" onclick={close}>Đóng</button>
      </div>
      <p class="sr-only" role="status">{status}</p>
      <div class="search-body">
        {#if failed}
          <p role="alert">Không tải được danh sách để tìm. Kiểm tra kết nối mạng rồi thử lại.</p>
          <p><button type="button" class="btn ghost plain" onclick={load}>Thử lại</button></p>
        {:else if !src}
          <p class="muted small">Đang tải danh sách…</p>
        {:else if !typed}
          <p class="muted small">Gõ ít nhất 2 ký tự, không cần dấu. Ví dụ: <b>dat coc</b>, <b>thua ke</b>, <b>chu quyen</b>.</p>
        {:else if !res.total}
          <p>Không thấy kết quả cho “{query.trim()}”.</p>
          <p class="muted small">Thử gõ ít từ hơn hoặc chỉ gõ phần đầu của thuật ngữ. Ô này tìm theo tên khái niệm, tên môn và tên bộ đề.</p>
        {:else}
          {#if res.concepts.length}
            <h2 class="sr-group">Khái niệm</h2>
            <ul class="sr-list">
              {#each res.concepts as h (h.subject + '/' + h.id)}
                <li><a class="sr-hit" href={hashFor('concepts', { subject: h.subject, concept: h.id })} onclick={close}><b>{h.term}</b><span class="chip">{h.short}</span></a></li>
              {/each}
            </ul>
            {#if more > 0}<p class="muted small sr-more">và {more} khái niệm khác — gõ thêm từ để thu hẹp.</p>{/if}
          {/if}
          {#if res.subjects.length}
            <h2 class="sr-group">Môn học</h2>
            <ul class="sr-list">
              {#each res.subjects as s (s.id)}
                <li><a class="sr-hit" href={hashFor('subject', { subject: s.id })} onclick={close}><b>{s.title}</b></a></li>
              {/each}
            </ul>
          {/if}
          {#if res.sets.length}
            <h2 class="sr-group">Bộ đề</h2>
            <ul class="sr-list">
              {#each res.sets as s (s.id)}
                <li><a class="sr-hit" href={hashFor('quiz', { id: s.id })} onclick={close}><b>{s.title}</b><span class="chip">{GROUPS[s.group] ?? s.group}</span></a></li>
              {/each}
            </ul>
          {/if}
        {/if}
      </div>
    </div>
  {/if}
</dialog>
