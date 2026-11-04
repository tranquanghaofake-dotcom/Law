<script lang="ts">
  // Dấu mộc triện son "×3 CHUỖI!" đóng xuống giữa màn hình rồi bay về ô lửa. Chỉ animate transform/opacity.
  import { onDestroy, onMount } from 'svelte';
  import { COMBO_COLORS } from './combo';
  import { TIMING, type Stamp } from './reward';

  let { stamp, onend }: { stamp: Stamp; onend: () => void } = $props();
  let dx = $state(0), dy = $state(0);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const ring = $derived(COMBO_COLORS[stamp.tier]);
  onMount(() => {
    // bay về ô lửa trên thanh phiên (nếu tìm thấy), không thì lên đầu màn hình
    const t = document.querySelector('.session-bar .combo, .session-bar .progress')?.getBoundingClientRect();
    if (t) { dx = t.left + t.width / 2 - window.innerWidth / 2; dy = t.top + t.height / 2 - window.innerHeight / 2; }
    else { dx = 0; dy = -window.innerHeight / 2; }
    timer = setTimeout(onend, TIMING.stampTotal);
  });
  onDestroy(() => clearTimeout(timer));
</script>

<div class="stamp-wrap" aria-hidden="true" data-tier={stamp.tier} style="--dx:{dx}px;--dy:{dy}px;--ring:{ring.line};--ring2:{ring.glow};--dur:{TIMING.stampTotal}ms">
  <div class="stamp">
    <span class="big">{stamp.big}</span>
    <span class="sub">{stamp.sub}</span>
  </div>
</div>

<style>
  .stamp-wrap { position: fixed; left: 50%; top: 42%; z-index: 80; pointer-events: none; width: 0; height: 0; animation: stamp-fly var(--dur) cubic-bezier(.3, .7, .3, 1) both; will-change: transform, opacity; }
  .stamp {
    position: absolute; left: -78px; top: -78px; width: 156px; height: 156px; display: grid; place-content: center; justify-items: center; gap: 2px;
    border-radius: 10px; color: #fff4ea; background: var(--seal, #b3261e);
    border: 4px solid #fff4ea; outline: 4px solid var(--seal, #b3261e); outline-offset: -1px;
    box-shadow: 0 0 0 5px var(--ring), 0 6px 18px rgba(80, 10, 5, .35);
    font-family: var(--font-quote, Georgia, serif); text-align: center; transform: rotate(-7deg);
    background-image: repeating-linear-gradient(135deg, transparent 0 9px, rgba(255, 255, 255, .05) 9px 10px);
  }
  .stamp::before { content: ''; position: absolute; inset: 6px; border: 2px solid rgba(255, 244, 234, .65); border-radius: 5px; }
  .big { font-size: 56px; font-weight: 900; line-height: 1; letter-spacing: -.02em; text-shadow: 0 2px 0 rgba(60, 5, 0, .35); }
  .sub { font-size: 20px; font-weight: 800; letter-spacing: .14em; }
  @media (max-width: 479px) { .stamp { transform: rotate(-7deg) scale(.82); } }
  /* 0–12%: đóng xuống (to → đúng cỡ, chạm giấy), giữ đến ~64%, rồi thu nhỏ bay về ô lửa */
  @keyframes stamp-fly {
    0% { opacity: 0; transform: translate(0, -24px) scale(2.3); }
    12% { opacity: 1; transform: translate(0, 0) scale(1); }
    16% { transform: translate(0, 0) scale(1.07); }
    22% { transform: translate(0, 0) scale(1); }
    64% { opacity: 1; transform: translate(0, 0) scale(1); }
    100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.12); }
  }
</style>
