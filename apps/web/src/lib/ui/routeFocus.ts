/**
 * Đổi route trong SPA: trình duyệt không tự chuyển focus, người dùng bàn phím/trình đọc màn hình bị "lạc"
 * (link vừa bấm biến mất → focus về body). Sau khi màn mới render, đưa focus tới h1 của màn (hoặc <main>),
 * không cuộn trang. Màn tải lười có thể chưa có h1 ngay: chờ tối đa `timeoutMs`.
 */
export function focusRouteHeading(doc: Document = document, timeoutMs = 2000): Promise<HTMLElement | null> {
  const find = (): HTMLElement | null => {
    const main = doc.getElementById('main');
    if (!main) return null;
    return (main.querySelector('h1') as HTMLElement | null) ?? null;
  };
  const apply = (el: HTMLElement | null): HTMLElement | null => {
    const target = el ?? doc.getElementById('main');
    if (!target) return null;
    // Một phần tử khác đã tự lấy focus (vd. nút trong thẻ học, ô tìm kiếm): không giành lại.
    const active = doc.activeElement as HTMLElement | null;
    if (active && active !== doc.body && active.isConnected && doc.getElementById('main')?.contains(active)) return active;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    return target;
  };
  return new Promise((resolve) => {
    const now = find();
    if (now) { resolve(apply(now)); return; }
    const root = doc.body;
    let done = false;
    const finish = (el: HTMLElement | null) => { if (done) return; done = true; obs.disconnect(); clearTimeout(timer); resolve(apply(el)); };
    const obs = new MutationObserver(() => { const h = find(); if (h) finish(h); });
    obs.observe(root, { childList: true, subtree: true });
    const timer = setTimeout(() => finish(null), timeoutMs);
  });
}
