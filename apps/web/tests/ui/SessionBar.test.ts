import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import SessionBar from '$lib/ui/SessionBar.svelte';

describe('SessionBar', () => {
  it('hiện tên ngữ cảnh khi có title', () => {
    const { container } = render(SessionBar, { props: { done: 1, total: 5, title: 'Hiến pháp là gì' } });
    expect(container.querySelector('.session-bar .title')?.textContent).toBe('Hiến pháp là gì');
  });
  it('không có phần tử title khi không truyền', () => {
    const { container } = render(SessionBar, { props: { done: 1, total: 5 } });
    expect(container.querySelector('.session-bar .title')).toBeNull();
  });
});
