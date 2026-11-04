<script lang="ts">
  // Số đếm tăng dần: đếm từ số đã thấy lần trước (khoá `key`, localStorage) hoặc từ `from` tới `value`.
  // Trình đọc màn hình chỉ nghe số cuối (bản đếm aria-hidden). Giảm chuyển động → hiện ngay.
  import { onMount, untrack } from 'svelte';
  import { countAt, startOf } from './countUp';
  import { reducedMotion } from '$lib/fx/confetti';
  let { value, key, from, duration = 800 }: { value: number; key?: string; from?: number; duration?: number } = $props();
  let shown = $state(untrack(() => from ?? value));
  let raf = 0;
  const K = (k: string) => `ll-count-${k}`;

  const stop = () => { if (raf && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(raf); raf = 0; };
  function run(start: number, end: number) {
    stop();
    if (start === end || reducedMotion() || typeof requestAnimationFrame === 'undefined') { shown = end; return; }
    const t0 = performance.now();
    const f = (now: number) => { const t = (now - t0) / duration; shown = countAt(start, end, t); if (t < 1) raf = requestAnimationFrame(f); };
    shown = start; raf = requestAnimationFrame(f);
  }
  let mounted = false;
  onMount(() => {
    let seen: number | null = null;
    if (key) { try { const v = localStorage.getItem(K(key)); seen = v === null ? null : Number(v); } catch { /* bỏ qua */ } }
    run(startOf(value, seen, from), value);
    mounted = true;
    return stop;
  });
  // số đổi khi đang mở trang → đếm từ số đang hiện
  $effect(() => {
    const v = value;
    if (key) { try { localStorage.setItem(K(key), String(v)); } catch { /* bỏ qua */ } }
    if (mounted) untrack(() => run(shown, v));
  });
</script>

<span class="count-up" aria-hidden="true">{shown}</span><span class="sr-only">{value}</span>
