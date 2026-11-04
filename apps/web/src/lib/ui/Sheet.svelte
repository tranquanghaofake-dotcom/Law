<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  // Hộp thoại chi tiết dùng chung ở Hồ sơ (cây chức vụ, tủ sách): <dialog> modal gốc của trình duyệt — focus bị giữ trong hộp,
  // Esc đóng, chạm nền tối đóng, đóng xong focus về nút đã mở. Điện thoại: ngăn kéo trượt lên từ đáy; ≥ 768: hộp giữa màn hình.
  import type { Snippet } from 'svelte';
  let { open = $bindable(false), title, kicker = '', children }: { open?: boolean; title: string; kicker?: string; children: Snippet } = $props();
  const id = `sheet-${++seq}`;
  let dlg = $state<HTMLDialogElement | null>(null);
  $effect(() => {
    if (!dlg) return;
    if (open && !dlg.open) {
      // jsdom (test) chưa có showModal: rơi về thuộc tính open
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    } else if (!open && dlg.open) {
      if (typeof dlg.close === 'function') dlg.close(); else dlg.removeAttribute('open');
    }
  });
  function onclose() { open = false; }
  // chạm vào nền tối (chính phần tử <dialog>, ngoài thẻ nội dung) thì đóng
  function backdrop(e: MouseEvent) { if (e.target === dlg) open = false; }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dlg} class="sheet" aria-labelledby={id} {onclose} onclick={backdrop}>
  {#if open}
    <div class="sheet-card">
      <header class="sheet-head">
        <div>
          {#if kicker}<p class="kicker">{kicker}</p>{/if}
          <h2 {id}>{title}</h2>
        </div>
        <button type="button" class="sheet-x" onclick={() => (open = false)}><Glyph name="close" size={16} /> Đóng</button>
      </header>
      <div class="sheet-body">{@render children()}</div>
    </div>
  {/if}
</dialog>
