// Cổng chuyển động: tạm dừng mọi animation CSS/SMIL bên trong một khối khi khối ra khỏi màn hình, khi tab ẩn,
// hoặc (tuỳ chọn `settle`) sau một lúc không tương tác — rê chuột/chạm vào khối thì chạy lại.
// Lý do: trong một <svg> có filter/mask, bất kỳ animation nào (kể cả opacity) cũng bắt trình duyệt vẽ lại cả khối
// mỗi khung hình. Đo trên Chromium CPU chậm 4×: cảnh đầu trang Hôm nay ~750 ms/4 s bận luồng chính, dừng đi còn ~80 ms.
// Trạng thái ghi ở thuộc tính `data-motion` ("run" | "off" | "rest"); CSS ở app.css dừng animation theo thuộc tính đó.

export type MotionState = 'run' | 'off' | 'rest';

/** Hàm thuần (test được): trạng thái theo ba điều kiện. */
export function motionState(visible: boolean, pageVisible: boolean, settled: boolean): MotionState {
  if (!visible || !pageVisible) return 'off';
  return settled ? 'rest' : 'run';
}

type Opts = { settle?: number } | undefined;

export function motionGate(node: HTMLElement | SVGElement, opts: Opts = {}) {
  let settle = opts?.settle ?? 0;
  let visible = true, pageVisible = typeof document === 'undefined' || !document.hidden, settled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const svgs = () => [...(node instanceof SVGSVGElement ? [node] : []), ...node.querySelectorAll('svg')] as SVGSVGElement[];

  function apply() {
    const s = motionState(visible, pageVisible, settled);
    if (node.getAttribute('data-motion') === s) return;
    node.setAttribute('data-motion', s);
    // SMIL không theo animation-play-state: dừng/chạy tay
    for (const svg of svgs()) { try { if (s === 'run') svg.unpauseAnimations(); else svg.pauseAnimations(); } catch { /* jsdom */ } }
  }
  function arm() {
    clearTimeout(timer);
    if (settle > 0) timer = setTimeout(() => { settled = true; apply(); }, settle);
  }
  function wake() { if (settled) { settled = false; apply(); } arm(); }
  const onVis = () => { pageVisible = !document.hidden; apply(); };

  let io: IntersectionObserver | undefined;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver((es) => {
      const v = es[es.length - 1].isIntersecting;
      if (v === visible) return;
      visible = v; if (v) { settled = false; arm(); }
      apply();
    }, { rootMargin: '80px' });
    io.observe(node);
  }
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVis);
  node.addEventListener('pointerenter', wake);
  node.addEventListener('focusin', wake);
  apply(); arm();

  return {
    update(o: Opts) { settle = o?.settle ?? 0; wake(); },
    destroy() {
      clearTimeout(timer); io?.disconnect();
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVis);
      node.removeEventListener('pointerenter', wake); node.removeEventListener('focusin', wake);
    },
  };
}
