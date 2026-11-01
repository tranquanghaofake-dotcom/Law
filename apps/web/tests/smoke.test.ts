import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import App from '../src/App.svelte';

describe('khung ứng dụng', () => {
  it('hiển thị tên thương hiệu', () => {
    render(App);
    // topbar (mobile) và sidenav (desktop) đều mang tên; CSS quyết định cái nào hiển thị
    expect(screen.getAllByText(/Luyện Luật/).length).toBeGreaterThanOrEqual(1);
  });
});
