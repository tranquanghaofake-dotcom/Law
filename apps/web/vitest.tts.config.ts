// Chỉ dùng cho `npm run tts:texts` (workflow Giọng đọc): chạy scripts/tts-texts.ts bằng chính code app để gom mọi câu có thể đọc.
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { $lib: fileURLToPath(new URL('./src/lib', import.meta.url)) } },
  test: { include: ['scripts/tts-texts.ts'], environment: 'node', testTimeout: 900_000 },
});
