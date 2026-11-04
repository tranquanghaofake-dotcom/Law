import 'fake-indexeddb/auto';
import { beforeAll } from 'vitest';

// Tranh nạp lười ({#await import(...)} trong SubjectArt, Vignette, Emblem): nạp sẵn để import() trong component trả về ngay
// từ bộ nhớ đệm module. Không có bước này, trên máy CI chậm test có thể kết thúc khi import còn dở
// → lỗi "Vite module runner has been closed" (CI đỏ dù mọi test đạt).
beforeAll(async () => {
  await Promise.all([import('$lib/art/ScenesMore.svelte'), import('$lib/art/VignetteMore.svelte'), import('$lib/art/EmblemMore.svelte')]);
});
