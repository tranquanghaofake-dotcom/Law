// Thẻ phản hồi sau khi trả lời: nếu đầu thẻ nằm dưới mép màn hình (câu hỏi dài đẩy thẻ xuống) thì cuộn xuống đủ để thấy
// kết quả đúng/sai, không để người học tự đoán là phải cuộn. Đã thấy sẵn thì KHÔNG cuộn (tránh giật).

/** Đầu thẻ phải cách mép dưới khung nhìn ít nhất từng này px mới coi là "đã thấy". */
const MIN_VISIBLE = 160;
/** Sau khi cuộn, đầu thẻ nằm ở tỉ lệ này của chiều cao khung nhìn (còn thấy cuối câu hỏi phía trên). */
const AT = 0.35;

/** Số px cần cuộn xuống (0 = không cuộn). `top` là vị trí đầu thẻ so với khung nhìn. */
export function revealDelta(top: number, viewportHeight: number): number {
  return top > viewportHeight - MIN_VISIBLE ? Math.round(top - viewportHeight * AT) : 0;
}

const reduced = (): boolean => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Svelte action gắn vào thẻ phản hồi. Chờ một khung hình để bố cục ổn định rồi mới đo. */
export function revealFeedback(node: HTMLElement): { destroy(): void } {
  const raf = requestAnimationFrame(() => {
    const d = revealDelta(node.getBoundingClientRect().top, window.innerHeight);
    if (d <= 0) return;
    try { window.scrollBy({ top: d, behavior: reduced() ? 'auto' : 'smooth' }); } catch { /* jsdom/trình duyệt cũ: bỏ qua */ }
  });
  return { destroy: () => cancelAnimationFrame(raf) };
}
