import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import Shell from '$lib/ui/Shell.svelte';

const children = createRawSnippet(() => ({ render: () => '<p data-testid="noi-dung">nội dung</p>' }));

describe('Shell', () => {
  it('đánh dấu mục đang chọn bằng aria-current ở cả sidenav lẫn tabbar', () => {
    const { container } = render(Shell, { props: { active: 'subject', children } });
    const side = container.querySelector('.sidenav [aria-current="page"]');
    const tab = container.querySelector('.tabbar [aria-current="page"]');
    expect(side?.textContent).toContain('Môn học');
    expect(tab?.textContent).toContain('Môn học');
    expect(container.querySelectorAll('[aria-current="page"]')).toHaveLength(2);
  });
  it('Hôm nay không aria-current khi đang ở Môn học; nội dung nằm trong main#main', () => {
    const { container } = render(Shell, { props: { active: 'subject', children } });
    const home = container.querySelector('.sidenav a[href="#/"]');
    expect(home?.getAttribute('aria-current')).toBeNull();
    expect(container.querySelector('[data-testid="noi-dung"]')?.closest('main')?.id).toBe('main');
  });
  it('không render rail khi không truyền snippet rail', () => {
    const { container } = render(Shell, { props: { active: 'home', children } });
    expect(container.querySelector('.rail')).toBeNull();
  });
});
