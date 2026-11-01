import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import App from '../src/App.svelte';

describe('khung ứng dụng', () => {
  it('hiển thị tên thương hiệu', () => {
    render(App);
    expect(screen.getByText(/Luyện Luật/)).toBeTruthy();
  });
});
