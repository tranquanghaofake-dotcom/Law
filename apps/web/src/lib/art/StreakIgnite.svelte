<script lang="ts">
  // Màn thắp chuỗi toàn màn hình (đợt 10) — lần đầu chuỗi tăng trong ngày, ở cuối phiên học:
  //  1) thẻ chuyên cần mini bay lên và phóng to giữa màn hình (FLIP, chỉ animate transform);
  //  2) đốm sáng màu lửa của chu kỳ bay từ ngoài mép vào hai đích: con số giữa huy hiệu và ký hoạ của ngày;
  //  3) đốm tới nơi: con số đổi sang ngày mới, bừng sáng rồi tắt dần (số khắc giữ nguyên), ký hoạ thắp và giữ sáng;
  //  4) chạm/Esc/nút "Tiếp tục" hoặc sau 7 s: thẻ thu về chỗ thẻ mini.
  // Giảm chuyển động: chỉ hiện thẻ trạng thái mới, không bay, không đốm. Đốm sáng là phần tử HTML animate transform/opacity (compositor).
  import { onMount, tick, untrack } from 'svelte';
  import StreakCard, { NUM_POINT, glyphPoint } from './StreakCard.svelte';
  import { cardFor } from '$lib/game/card';
  import { streakView } from '$lib/ui/streakView';
  import { flight, type Mote } from '$lib/ui/ignite';
  import { reducedMotion } from '$lib/fx/confetti';
  let { count, longest, origin, onclose }: { count: number; longest: number; origin?: HTMLElement | null; onclose: () => void } = $props();

  const still = reducedMotion();
  const view = $derived(streakView(count, longest));
  let shown = $state(untrack(() => (still ? count : Math.max(0, count - 1)))); // cố ý chỉ lấy giá trị đầu: thẻ hiện số hôm qua rồi mới đổi
  let arrived = $state(still);
  let leaving = false;
  let stage: HTMLDivElement | undefined = $state();
  let dialog: HTMLDivElement | undefined = $state();
  let btn: HTMLButtonElement | undefined = $state();
  let motes: (Mote & { kind: 'num' | 'glyph' })[] = $state([]);
  const timers: ReturnType<typeof setTimeout>[] = [];
  const later = (ms: number, f: () => void) => timers.push(setTimeout(f, ms));
  const FLY = 950;
  // Web Animations có thể vắng (jsdom, trình duyệt rất cũ) → bỏ qua chuyển động, giữ nội dung
  const anim = (el: Element | undefined, k: Keyframe[], o: KeyframeAnimationOptions): Animation | null => (el && typeof el.animate === 'function' ? el.animate(k, o) : null);

  /** transform đưa sân khấu (ở vị trí cuối) về trùng khung thẻ mini */
  function fromOrigin(): string | null {
    if (!origin || !stage) return null;
    const a = origin.getBoundingClientRect(), b = stage.getBoundingClientRect();
    if (!a.width || !b.width) return null;
    return `translate(${a.left + a.width / 2 - (b.left + b.width / 2)}px, ${a.top + a.height / 2 - (b.top + b.height / 2)}px) scale(${a.width / b.width})`;
  }

  onMount(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    btn?.focus({ preventScroll: true });
    if (!still && stage) {
      const from = fromOrigin();
      if (from) anim(stage, [{ transform: from }, { transform: 'none' }], { duration: 640, easing: 'cubic-bezier(.2, .8, .2, 1)' });
      anim(dialog, [{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'ease-out', fill: 'both' });
      // đốm sáng: 14 về con số, 8 về ký hoạ (nếu ngày có ký hoạ mới)
      later(520, async () => {
        if (!stage) return;
        const w = stage.clientWidth, h = stage.clientHeight, k = w / 856;
        const day = cardFor(count, longest).day;
        const g = glyphPoint(day);
        motes = [
          ...flight(14, { x: NUM_POINT.x * k, y: NUM_POINT.y * k }, { w, h }, count).map((m) => ({ ...m, kind: 'num' as const })),
          ...(g ? flight(8, { x: g.x * k, y: g.y * k }, { w, h }, count + 7).map((m) => ({ ...m, kind: 'glyph' as const, delay: m.delay + 160 })) : []),
        ];
        await tick();
        for (const el of stage.querySelectorAll<HTMLElement>('.ig-mote')) {
          const m = motes[Number(el.dataset.i)];
          const pts = Array.from({ length: 9 }, (_, j) => { const t = j / 8, u = 1 - t; return [u * u * m.x0 + 2 * u * t * m.cx + t * t * m.x1, u * u * m.y0 + 2 * u * t * m.cy + t * t * m.y1, t]; });
          anim(el, pts.map(([x, y, t]) => ({ transform: `translate(${x}px, ${y}px) scale(${1 - t * 0.55})`, opacity: t < 0.12 ? t / 0.12 : t > 0.92 ? (1 - t) / 0.08 : 1 })),
            { duration: FLY, delay: m.delay, easing: 'cubic-bezier(.45, 0, .7, .6)', fill: 'both' });
        }
      });
      // con số đổi + bừng sáng khi dòng đốm đầu tiên chạm đích
      later(520 + FLY + 260, () => { shown = count; arrived = true; });
    }
    later(7000, close);
    return () => { timers.forEach(clearTimeout); prevFocus?.focus?.({ preventScroll: true }); };
  });

  function close() {
    if (leaving) return; leaving = true;
    if (still || !stage) return onclose();
    const to = fromOrigin();
    const a = anim(stage, [{ transform: 'none', opacity: 1 }, { transform: to ?? 'scale(.6)', opacity: to ? 1 : 0 }], { duration: 420, easing: 'cubic-bezier(.4, 0, 1, 1)', fill: 'forwards' });
    anim(dialog, [{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-in', fill: 'forwards' });
    if (a) a.onfinish = () => onclose(); else onclose();
  }
  function key(e: KeyboardEvent) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    if (e.key === 'Tab') { e.preventDefault(); btn?.focus(); } // giữ focus trong hộp thoại (chỉ có một nút)
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="ig" bind:this={dialog} role="dialog" aria-modal="true" aria-label="Thắp chuỗi {count} ngày" tabindex="-1" onclick={close} onkeydown={key}
  style="--fire:{view.flame}; --glow:{view.glow}">
  <div class="ig-veil" aria-hidden="true"></div>
  <div class="ig-stage" bind:this={stage}>
    <StreakCard count={shown} {longest} ignite={arrived && !still} flare={arrived && !still} from={Math.max(0, count - 1)} />
    <div class="ig-motes" aria-hidden="true">
      {#each motes as m, i (i)}<i class="ig-mote {m.kind}" data-i={i} style="--s:{m.size.toFixed(1)}px"></i>{/each}
    </div>
  </div>
  <p class="ig-cap" class:on={arrived} role="status">
    <b>Chuỗi {count} ngày</b>{#if view.tierName} · {view.tierName} {view.day}/{view.total}{/if}
  </p>
  <button class="btn ig-btn" type="button" bind:this={btn} onclick={(e) => { e.stopPropagation(); close(); }}>Tiếp tục</button>
</div>
