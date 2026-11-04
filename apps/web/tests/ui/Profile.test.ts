import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/svelte';
import Profile from '../../src/routes/Profile.svelte';
import { route } from '$lib/router.svelte';
import { clearContentCache } from '$lib/content/loader';
import { shelf } from '$lib/ui/shelf.svelte';

const emptyIndex = { subjects: [], conceptCount: {}, sets: [] };
const stubFetch = () => vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(emptyIndex), { status: 200, headers: { 'content-type': 'application/json' } })));
const LS_KEY = 'll-profile-open';

describe('Profile (thẻ căn cước + 2 tab + 3 phần đóng/mở)', () => {
  beforeEach(() => { try { localStorage.removeItem(LS_KEY); } catch { /* bỏ qua */ } shelf.ready = true; shelf.books = []; shelf.subjects = []; });
  // Chờ phần tải dữ liệu bất đồng bộ của Profile xong rồi mới gỡ component, tránh lỗi jsdom "_location" sau khi môi trường đã đóng.
  afterEach(async () => { await new Promise((r) => setTimeout(r, 50)); cleanup(); vi.unstubAllGlobals(); clearContentCache(); route.name = 'home'; });

  it('tab Tổng quan được chọn ở #/toi; có tab Cài đặt trỏ #/cai-dat', async () => {
    stubFetch(); route.name = 'profile';
    const { container } = render(Profile);
    // Hai link điều hướng (không giả làm tablist ARIA): trang hiện tại có aria-current="page"
    expect(container.querySelectorAll('[role="tab"], [role="tablist"], [role="tabpanel"]')).toHaveLength(0);
    const tabs = container.querySelectorAll('nav.idc-tabs a');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute('aria-current')).toBe('page');
    expect(tabs[1].hasAttribute('aria-current')).toBe(false);
    expect(tabs[1].getAttribute('href')).toBe('#/cai-dat');
    await waitFor(() => expect(container.querySelector(".idc-title")).not.toBeNull());
  });
  it('đầu trang là thẻ căn cước: chức danh, chuỗi, số sách, chức kế tiếp; không còn thẻ "Thuần thục theo môn"', async () => {
    stubFetch(); route.name = 'profile';
    const { container } = render(Profile);
    const card = container.querySelector('.idcard')!;
    // h1 là chức danh (thấy được), kèm "Hồ sơ:" cho trình đọc màn hình (HT6: bỏ eyebrow IN HOA làm h1)
    expect(card.querySelector('h1')?.textContent).toBe('Hồ sơ: Công dân');
    expect(card.querySelector('h1')?.classList.contains('idc-title')).toBe(true);
    expect(card.textContent).toContain('ngày');
    expect(card.textContent).toContain('Chưa có chuỗi'); // nhãn bậc màu/tiến độ vòng 30 ngày ("Đỏ · 5/30" khi có chuỗi)
    expect(card.textContent).toMatch(/0\s*\/\s*0 sách|0\/0/);
    expect(card.textContent).toContain('Chức kế tiếp');
    expect(card.querySelector('[role="progressbar"]')).not.toBeNull();
    expect(container.textContent).not.toContain('Thuần thục theo môn');
    expect(container.querySelector('.page-head')).toBeNull();
  });
  it('2 phần accordion (Sự nghiệp · Chuyên cần & tiến độ): button[aria-expanded] + vùng role=region; mặc định chỉ mở "Sự nghiệp"', async () => {
    stubFetch(); route.name = 'profile';
    const { container } = render(Profile);
    const btns = [...container.querySelectorAll<HTMLButtonElement>('.acc-btn')];
    expect(btns.map((b) => b.querySelector('.acc-t')?.textContent)).toEqual(['Sự nghiệp', 'Chuyên cần & tiến độ']);
    expect(btns.map((b) => b.getAttribute('aria-expanded'))).toEqual(['true', 'false']);
    for (const b of btns) {
      const panel = container.querySelector(`#${b.getAttribute('aria-controls')}`)!;
      expect(panel.getAttribute('role')).toBe('region');
      expect(panel.getAttribute('aria-labelledby')).toBe(b.id);
    }
    expect(container.querySelector('.org')).not.toBeNull();
    expect(container.querySelector('.showcase')).not.toBeNull(); // cây và tủ trưng bày cùng một phần
    expect(container.querySelector('.cab > .idcard + .bk')).not.toBeNull(); // thẻ căn cước (đầu tủ) + tủ kính là MỘT khối, luôn hiện
    expect(container.querySelector('.sp')).toBeNull(); // phần Chuyên cần chưa mở chưa dựng
    expect(container.textContent).not.toContain('Xuất dữ liệu'); // "Dữ liệu" đã chuyển sang Cài đặt
    await new Promise((r) => setTimeout(r, 20));
  });
  it('bấm đầu mục mở phần đó (dựng nội dung) và nhớ trong localStorage; bấm lần nữa thì đóng', async () => {
    stubFetch(); route.name = 'profile';
    const { container } = render(Profile);
    const btn = [...container.querySelectorAll<HTMLButtonElement>('.acc-btn')].find((b) => b.textContent?.includes('Chuyên cần'))!;
    await fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    expect(JSON.parse(localStorage.getItem(LS_KEY)!)).toEqual(['su-nghiep', 'chuyen-can']);
    await waitFor(() => expect(container.textContent).toContain('Chưa học khái niệm nào'));
    await fireEvent.click(btn);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(JSON.parse(localStorage.getItem(LS_KEY)!)).toEqual(['su-nghiep']);
  });
  it('mở lại theo phần đã nhớ; localStorage hỏng thì dùng mặc định', async () => {
    stubFetch(); route.name = 'profile';
    localStorage.setItem(LS_KEY, JSON.stringify(['chuyen-can', 'khong-co']));
    const first = render(Profile);
    expect([...first.container.querySelectorAll('.acc-btn')].map((b) => b.getAttribute('aria-expanded'))).toEqual(['false', 'true']);
    expect(first.container.querySelector('.sp')).not.toBeNull();
    await new Promise((r) => setTimeout(r, 50)); cleanup();
    localStorage.setItem(LS_KEY, '{không phải json');
    const second = render(Profile);
    expect(second.container.querySelector('.acc-btn')?.getAttribute('aria-expanded')).toBe('true');
    await new Promise((r) => setTimeout(r, 20));
  });
  it('đổi id phần: giá trị cũ của đợt 5 (cay · trung-bay · chuyen-can · du-lieu) được chuyển đổi êm', async () => {
    stubFetch(); route.name = 'profile';
    localStorage.setItem(LS_KEY, JSON.stringify(['trung-bay', 'du-lieu']));
    const { container } = render(Profile);
    expect([...container.querySelectorAll('.acc-btn')].map((b) => b.getAttribute('aria-expanded'))).toEqual(['true', 'false']);
    await new Promise((r) => setTimeout(r, 50)); cleanup();
    localStorage.setItem(LS_KEY, JSON.stringify(['cay', 'chuyen-can']));
    const second = render(Profile);
    expect([...second.container.querySelectorAll('.acc-btn')].map((b) => b.getAttribute('aria-expanded'))).toEqual(['true', 'true']);
    await new Promise((r) => setTimeout(r, 20));
  });
  it('ở #/cai-dat hiện nội dung Cài đặt trong tab (không có các phần Hồ sơ)', async () => {
    stubFetch(); route.name = 'settings';
    const { container } = render(Profile);
    expect(container.querySelectorAll('nav.idc-tabs a')[1].getAttribute('aria-current')).toBe('page');
    expect(container.querySelector('.settings')).not.toBeNull();
    expect(container.querySelector('.acc-list')).toBeNull();
    expect(container.textContent).toContain('Xuất dữ liệu'); // khối Dữ liệu (xuất/nhập) ở Cài đặt
    expect(container.textContent).toContain('Nhập dữ liệu');
    await new Promise((r) => setTimeout(r, 20));
  });
});
