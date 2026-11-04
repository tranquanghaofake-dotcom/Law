<script lang="ts" module>
  let seq = 0;
</script>

<script lang="ts">
  import Glyph from '$lib/art/Glyph.svelte';
  // Hộp thoại chi tiết dùng chung ở Hồ sơ (cây chức vụ, tủ sách): <dialog> modal gốc của trình duyệt — focus bị giữ trong hộp,
  // Esc đóng, chạm nền tối đóng, đóng xong focus về nút đã mở. Điện thoại: ngăn kéo trượt lên từ đáy; ≥ 768: hộp giữa màn hình.
  import type { Snippet } from 'svelte';
  import { dragOffset, shouldDismiss } from './sheetDrag';
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
  // Điện thoại: kéo thanh nắm/đầu ngăn kéo xuống để đóng (đợt 10). Chỉ transform; thả tay chưa đủ thì bật về.
  let card = $state<HTMLDivElement | null>(null);
  let drag: { y0: number; t0: number; dy: number; id: number } | null = null;
  const phone = () => typeof matchMedia !== 'undefined' && matchMedia('(max-width: 767px)').matches;
  function down(e: PointerEvent) {
    if (!phone() || !card || (e.target as HTMLElement).closest('button')) return;
    drag = { y0: e.clientY, t0: performance.now(), dy: 0, id: e.pointerId };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    card.style.transition = 'none';
  }
  function move(e: PointerEvent) {
    if (!drag || !card || e.pointerId !== drag.id) return;
    drag.dy = e.clientY - drag.y0;
    card.style.transform = `translateY(${dragOffset(drag.dy)}px)`;
  }
  function up(e: PointerEvent) {
    if (!drag || !card || e.pointerId !== drag.id) return;
    const { dy, t0 } = drag; drag = null;
    const vy = dy / Math.max(1, performance.now() - t0);
    const c = card;
    if (shouldDismiss(dy, vy, c.offsetHeight)) {
      c.style.transition = 'transform var(--dur-2) var(--ease-in)';
      c.style.transform = 'translateY(100%)';
      setTimeout(() => { open = false; c.style.transform = ''; c.style.transition = ''; }, 200);
    } else {
      c.style.transition = 'transform var(--dur-3) var(--ease-spring)';
      c.style.transform = '';
    }
  }
  // chạm vào nền tối (chính phần tử <dialog>, ngoài thẻ nội dung) thì đóng
  function backdrop(e: MouseEvent) { if (e.target === dlg) open = false; }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dlg} class="sheet" aria-labelledby={id} {onclose} onclick={backdrop}>
  {#if open}
    <div class="sheet-card" bind:this={card}>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="sheet-drag" onpointerdown={down} onpointermove={move} onpointerup={up} onpointercancel={up}>
      <span class="sheet-grip" aria-hidden="true"></span>
      <header class="sheet-head">
        <div>
          {#if kicker}<p class="kicker">{kicker}</p>{/if}
          <h2 {id}>{title}</h2>
        </div>
        <button type="button" class="sheet-x" onclick={() => (open = false)}><Glyph name="close" size={16} /> Đóng</button>
      </header>
      </div>
      <div class="sheet-body">{@render children()}</div>
    </div>
  {/if}
</dialog>
