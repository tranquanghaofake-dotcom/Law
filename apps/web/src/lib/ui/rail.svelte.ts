/** Nội dung rail phải (≥ 1440 px) do từng trang đăng ký; Shell chỉ hiển thị. */
import type { Component } from 'svelte';

type RailEntry = { component: Component<any>; props?: Record<string, unknown> };

export const rail = $state<{ current: RailEntry | null }>({ current: null });

/** Đăng ký rail cho trang hiện tại; gọi hàm trả về để gỡ (dùng trong $effect). */
export function setRail(component: Component<any>, props: Record<string, unknown> = {}): () => void {
  rail.current = { component, props };
  return () => { if (rail.current?.component === component) rail.current = null; };
}
