// Bốn đích đến của app shell (spec §2.1). Thứ tự và nhãn dùng chung cho sidebar, rail, tab bar và test.
import type { RouteName } from '$lib/router.svelte';

export type NavName = 'home' | 'subjects' | 'quizzes' | 'profile';
export type NavItem = { name: NavName; label: string; href: string; matches: RouteName[] };

export const NAV: readonly NavItem[] = [
  { name: 'home', label: 'Hôm nay', href: '#/', matches: ['home'] },
  { name: 'subjects', label: 'Môn học', href: '#/mon', matches: ['subjects', 'subject', 'concepts'] },
  { name: 'quizzes', label: 'Luyện đề', href: '#/luyen-de', matches: ['quizzes'] },
  { name: 'profile', label: 'Hồ sơ', href: '#/toi', matches: ['profile', 'settings'] },
];

/** Mục nào đang sáng cho route này; null trong phiên học (shell ẩn). */
export function activeNav(route: RouteName): NavName | null {
  return NAV.find((n) => n.matches.includes(route))?.name ?? null;
}
