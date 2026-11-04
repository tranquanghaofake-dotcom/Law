import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import SideProfile from '$lib/ui/SideProfile.svelte';

describe('SideProfile (tủ gọn sidebar)', () => {
  it('có biển tên, số ngày, kệ sách một hàng và tiến độ; hai liên kết trỏ tới Hồ sơ', () => {
    const { container } = render(SideProfile);
    expect(container.querySelector('.me .me-title')?.textContent).toBeTruthy();
    expect(container.querySelector('.me .me-sub')?.textContent).toMatch(/sách/);
    expect(container.querySelector('.me .me-days b')).not.toBeNull();
    expect(container.querySelector('.side-glass .shelf.compact')).not.toBeNull();
    expect([...container.querySelectorAll('a.me, a.me-next')].every((a) => a.getAttribute('href') === '#/toi')).toBe(true);
  });
});
