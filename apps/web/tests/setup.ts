import 'fake-indexeddb/auto';
import { beforeAll } from 'vitest';

// Tranh nạp lười ({#await import(...)} trong SubjectArt, Vignette, Emblem): nạp sẵn để import() trong component trả về ngay
// từ bộ nhớ đệm module. Không có bước này, trên máy CI chậm test có thể kết thúc khi import còn dở
// → lỗi "Vite module runner has been closed" (CI đỏ dù mọi test đạt).
beforeAll(async () => {
  await Promise.all([import('$lib/art/ScenesMore.svelte'), import('$lib/art/VignetteMore.svelte'), import('$lib/art/EmblemMore.svelte')]);
});

// jsdom chưa có Web Animations (Element.animate) mà transition của Svelte 5 (fade ở tủ trưng bày) dùng nó.
// Giả lập tối thiểu: animation kết thúc ngay (trình duyệt thật đều có API này).
if (typeof Element !== 'undefined' && typeof Element.prototype.animate !== 'function') {
  Element.prototype.animate = function () {
    const a = { onfinish: null as null | (() => void), finished: Promise.resolve(), cancel() {}, finish() {}, pause() {}, play() {}, reverse() {}, currentTime: 0, playState: 'finished' };
    queueMicrotask(() => a.onfinish?.());
    return a as unknown as Animation;
  };
}
