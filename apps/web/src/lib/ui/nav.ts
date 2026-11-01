// Bốn đích đến của app shell (spec §2.1). Thứ tự và nhãn dùng chung cho sidebar, rail, tab bar và test.
import type { RouteName } from '$lib/router.svelte';

export type NavName = 'home' | 'subjects' | 'quizzes' | 'profile';
export type NavItem = { name: NavName; label: string; href: string; icon: string; matches: RouteName[] };

export const NAV: readonly NavItem[] = [
  { name: 'home', label: 'Hôm nay', href: '#/', icon: '☀', matches: ['home'] },
  { name: 'subjects', label: 'Môn học', href: '#/mon', icon: '📖', matches: ['subjects', 'subject'] },
  { name: 'quizzes', label: 'Luyện đề', href: '#/luyen-de', icon: '✎', matches: ['quizzes'] },
  { name: 'profile', label: 'Hồ sơ', href: '#/toi', icon: '👤', matches: ['profile', 'settings'] },
];

/** Mục nào đang sáng cho route này; null trong phiên học (shell ẩn). */
export function activeNav(route: RouteName): NavName | null {
  return NAV.find((n) => n.matches.includes(route))?.name ?? null;
}
