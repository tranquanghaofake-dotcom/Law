<script lang="ts">
  // Số đếm tăng dần: đếm từ số đã thấy lần trước (khoá `key`, localStorage) hoặc từ `from` tới `value`.
  // Trình đọc màn hình chỉ nghe số cuối (bản đếm aria-hidden). Giảm chuyển động → hiện ngay.
  import { onMount, untrack } from 'svelte';
  import { countAt, startOf } from './countUp';
  import { reducedMotion } from '$lib/fx/confetti';
  let { value, key, from, duration = 800, ready = true }: { value: number; key?: string; from?: number; duration?: number; ready?: boolean } = $props();
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
  // `ready = false` khi dữ liệu chưa tải xong (số tạm, vd. 0): hiện thẳng, KHÔNG ghi "số đã thấy", không đếm.
  let started = false;
  $effect(() => {
    const v = value, r = ready;
    untrack(() => {
      if (!r) { stop(); shown = v; return; }
      if (!started) {
        started = true;
        let seen: number | null = null;
        if (key) { try { const x = localStorage.getItem(K(key)); seen = x === null ? null : Number(x); } catch { /* bỏ qua */ } }
        run(startOf(v, seen, from), v);
      } else run(shown, v); // số đổi khi đang mở trang → đếm từ số đang hiện
      if (key) { try { localStorage.setItem(K(key), String(v)); } catch { /* bỏ qua */ } }
    });
  });
  onMount(() => stop);
</script>

<span class="count-up" aria-hidden="true">{shown}</span><span class="sr-only">{value}</span>
