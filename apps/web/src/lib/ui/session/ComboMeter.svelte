<script lang="ts">
  // Ô lửa chuỗi đúng cạnh thanh tiến độ: 3 lớp lửa lồng nhau, màu theo mốc (cùng nguồn với viền và thanh),
  // to dần theo mốc; lên mốc → bùng nhẹ + tia lửa; sai → tắt dịu. Chỉ animate transform/opacity.
  import { onDestroy, untrack } from 'svelte';
  import { reducedMotion } from '$lib/fx/confetti';
  import { comboTier, fireStyle, fireTheme, glowLevel } from './combo';
  let { combo = 0 }: { combo?: number } = $props();
  const uid = $props.id();
  // đọc reactive: đổi cài đặt giảm chuyển động là có hiệu lực ngay
  const rm = $derived(reducedMotion());

  // giữ chuỗi dương cuối cùng để lúc tắt dịu ngọn lửa vẫn đúng màu/cỡ
  // svelte-ignore state_referenced_locally
  let held = $state(combo);
  let out = $state(false);
  let pulse = $state(false);
  let sparks = $state(false);
  let prevLevel = 0;
  let burstTimer: ReturnType<typeof setTimeout> | undefined;
  $effect(() => {
    const lv = glowLevel(combo);
    const calm = rm;
    if (combo > 0) {
      held = combo; out = false;
      if (lv > prevLevel && !calm) {
        // bật/tắt class, không dựng lại SVG
        clearTimeout(burstTimer);
        pulse = true; sparks = true;
        burstTimer = setTimeout(() => { pulse = false; sparks = false; }, 900);
      }
      prevLevel = lv;
      return;
    }
    prevLevel = 0;
    if (untrack(() => held) > 0) {
      out = true;
      const t = setTimeout(() => { held = 0; out = false; }, calm ? 0 : 650);
      return () => clearTimeout(t);
    }
  });
  onDestroy(() => clearTimeout(burstTimer));

  const shownCombo = $derived(combo > 0 ? combo : held);
  const theme = $derived(fireTheme(shownCombo));
  const t = $derived(comboTier(shownCombo));
  const SPARKS = [[-9, -22, 0], [8, -26, 90], [-3, -30, 180], [12, -18, 260]] as const;
</script>

{#if held > 0 || combo > 0}
  <span
    class="combo lv{theme.level}"
    class:out
    class:rm
    role="status"
    aria-label="Chuỗi đúng {shownCombo} câu{t.mult > 1 ? `, nhân ${t.label}` : ''}"
    style="{fireStyle(shownCombo)};--sc:{theme.scale}"
  >
    <span class="flame" class:pulse aria-hidden="true">
        <span class="grow">
          <svg viewBox="0 0 24 32" width="17" height="22" focusable="false">
            <defs>
              <linearGradient id="{uid}-o" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--fire-a)" /><stop offset="1" stop-color="var(--fire-b)" /></linearGradient>
              <linearGradient id="{uid}-m" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="var(--fire-b)" /><stop offset="1" stop-color="var(--fire-c)" stop-opacity=".9" /></linearGradient>
            </defs>
            <path class="l1" stroke="var(--fire-a)" stroke-width=".9" stroke-linejoin="round" fill="url(#{uid}-o)" d="M12 31C5 31 2.5 25.5 4.5 19.5C6 15 9.5 12.5 10 6C10.4 3.6 11.2 2 11.5 1C14 4 20 11 20.5 20C21 26 17.5 31 12 31Z" />
            <path class="l2" fill="url(#{uid}-m)" d="M12 30.2C7.5 30.2 6 26.2 7.5 21.8C8.5 18.8 10.5 17.2 11 12.8C14.5 15.2 17.5 19.2 17 24.2C16.7 27.7 15 30.2 12 30.2Z" />
            <path class="l3" fill="var(--fire-c)" d="M12 29.6C9.6 29.6 8.8 27.2 9.8 25C10.6 23.2 11.6 22.6 12 20.8C14 22.8 15.6 24.8 14.8 27.2C14.4 28.7 13.5 29.6 12 29.6Z" />
          </svg>
        </span>
        {#if sparks && !rm}
          {#each SPARKS as [dx, dy, d], i (i)}<i class="sp" style="--dx:{dx}px;--dy:{dy}px;animation-delay:{d}ms"></i>{/each}
        {/if}
    </span>
    <b>{shownCombo}</b>
    {#if t.mult > 1}<small>{t.label}</small>{/if}
    {#if t.next}<i class="meter" aria-hidden="true"><span style="width:{t.progress * 100}%"></span></i>{/if}
  </span>
{/if}

<style>
  .combo {
    position: relative; display: inline-flex; align-items: center; gap: var(--sp-1); flex: none;
    min-height: 32px; padding: 0 var(--sp-2) 0 var(--sp-1); border-radius: 999px; font-size: var(--fs-sm); color: var(--ink);
    border: 1px solid color-mix(in srgb, var(--fire-b) 55%, var(--line));
    background: color-mix(in srgb, var(--fire-b) 12%, var(--card));
    transition: border-color var(--fire-dur) ease, background-color var(--fire-dur) ease, opacity .55s ease, transform .55s ease,
      --fire-a var(--fire-dur) ease, --fire-b var(--fire-dur) ease, --fire-c var(--fire-dur) ease;
    animation: combo-in .4s ease backwards;
  }
  .combo.out { opacity: 0; transform: translateY(2px) scale(.92); }
  .combo b { font-variant-numeric: tabular-nums; min-width: 1ch; }
  .combo small { font-size: var(--fs-xs); font-weight: 700; color: var(--fire-a); }
  .combo.lv6 b, .combo.lv5 b { font-weight: 800; }

  .flame { position: relative; display: inline-block; width: 20px; height: 28px; flex: none; }
  .grow {
    position: absolute; left: 1.5px; bottom: 1px; width: 17px; height: 22px; transform-origin: 50% 100%;
    transform: scale(var(--sc)); transition: transform .5s cubic-bezier(.3, 1.5, .5, 1); will-change: transform;
  }
  .out .grow { transform: scale(calc(var(--sc) * .5), 0.05); transition: transform .6s ease-in; }
  .flame svg { display: block; overflow: visible; }
  .flame svg path { transform-box: fill-box; transform-origin: 50% 100%; will-change: transform; }
  .l1 { animation: sway-a 1.15s ease-in-out infinite alternate; }
  .l2 { animation: sway-b .8s ease-in-out infinite alternate; }
  .l3 { animation: sway-c .55s ease-in-out infinite alternate; }
  .lv5 .l1, .lv6 .l1 { animation-duration: .9s; }
  .lv5 .l2, .lv6 .l2 { animation-duration: .62s; }
  .lv5 .l3, .lv6 .l3 { animation-duration: .44s; }

  .pulse { animation: burst .6s cubic-bezier(.3, 1.6, .5, 1); transform-origin: 50% 100%; }

  .sp {
    position: absolute; left: 50%; bottom: 12px; width: 4px; height: 4px; margin-left: -2px; border-radius: 50%;
    background: var(--fire-c); opacity: 0; pointer-events: none; will-change: transform, opacity;
    animation: spark .85s ease-out both;
  }

  .meter { position: absolute; left: var(--sp-2); right: var(--sp-2); bottom: -5px; height: 3px; border-radius: 2px; background: var(--line); overflow: hidden; }
  .meter span { display: block; height: 100%; background: linear-gradient(90deg, var(--fire-a), var(--fire-b)); transition: width .25s ease; }

  @keyframes combo-in { from { opacity: 0; transform: scale(.85); } to { opacity: 1; transform: none; } }
  @keyframes sway-a { from { transform: scale(1, 1) skewX(-2deg); } to { transform: scale(.96, 1.08) skewX(2.5deg); } }
  @keyframes sway-b { from { transform: scale(1, .96) skewX(3deg); } to { transform: scale(1.04, 1.07) skewX(-3deg); } }
  @keyframes sway-c { from { transform: scale(.92, .94); opacity: .85; } to { transform: scale(1.06, 1.1); opacity: 1; } }
  @keyframes burst { 0% { transform: scale(1); } 35% { transform: scale(1.18, 1.12); } 100% { transform: scale(1); } }
  @keyframes spark { 0% { opacity: 0; transform: translate(0, 0) scale(1); } 15% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(.3); } }

  /* giảm chuyển động: không lay, không tia, không bùng — chỉ đổi màu */
  .rm, .rm * { animation: none !important; }
  .rm .grow, .rm.out .grow { transition: none; }
</style>
