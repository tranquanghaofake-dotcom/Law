import { defineConfig } from 'vitest/config';

// Test nội dung chạy thuần Node (không jsdom) nên rất nhanh (< 3 s).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
