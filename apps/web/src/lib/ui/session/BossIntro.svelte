<script lang="ts">
  // Màn dạo đầu ngắn trước câu chốt cuối phiên. Tự qua sau ~1,6 s hoặc bấm nút / Enter.
  import { onMount } from 'svelte';
  let { ondone }: { ondone: () => void } = $props();
  let done = false;
  function finish() { if (done) return; done = true; ondone(); }
  onMount(() => { const t = setTimeout(finish, 1600); return () => clearTimeout(t); });
  function focusOnMount(node: HTMLElement) { node.focus({ preventScroll: true }); }
</script>

<section class="card boss-intro" aria-label="Câu chốt">
  <p class="kicker">Câu chốt</p>
  <p class="boss-title">Câu cuối của phiên</p>
  <p class="muted">Trả lời đúng để chốt những gì vừa học.</p>
  <button class="btn primary" type="button" onclick={finish} use:focusOnMount>Vào câu chốt</button>
</section>
