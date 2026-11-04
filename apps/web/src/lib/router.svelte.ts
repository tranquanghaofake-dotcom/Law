import { flushSync } from 'svelte';
import { focusRouteHeading } from './ui/routeFocus';
export type RouteName = 'home' | 'subjects' | 'subject' | 'concepts' | 'quizzes' | 'lesson' | 'review' | 'quiz' | 'profile' | 'settings' | 'notfound';
export type Route = { name: RouteName; params: Record<string, string> };

const HOME: Route = { name: 'home', params: {} };

export function parseHash(hash: string): Route {
  const segs = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  const [a, b, c] = segs;
  if (a === 'bo' && b) return { name: 'quiz', params: { id: b } };
  if (a === 'hoc' && b && c) return { name: 'lesson', params: { subject: b, lesson: c } };
  if (a === 'on') return { name: 'review', params: b ? { subject: b } : {} };
  if (a === 'mon' && b && c === 'khai-niem') return { name: 'concepts', params: segs[3] ? { subject: b, concept: segs[3] } : { subject: b } };
  if (a === 'mon') return b ? { name: 'subject', params: { subject: b } } : { name: 'subjects', params: {} };
  if (a === 'luyen-de') return { name: 'quizzes', params: {} };
  if (a === 'toi') return { name: 'profile', params: {} };
  if (a === 'cai-dat') return { name: 'settings', params: {} };
  if (!a) return HOME;
  return { name: 'notfound', params: {} };
}

export function hashFor(name: RouteName, params: Record<string, string> = {}): string {
  const e = (s: string) => encodeURIComponent(s);
  switch (name) {
    case 'quiz': return `#/bo/${e(params.id)}`;
    case 'lesson': return `#/hoc/${e(params.subject)}/${e(params.lesson)}`;
    case 'review': return params.subject ? `#/on/${e(params.subject)}` : '#/on';
    case 'subjects': return '#/mon';
    case 'subject': return `#/mon/${e(params.subject)}`;
    case 'concepts': return `#/mon/${e(params.subject)}/khai-niem${params.concept ? `/${e(params.concept)}` : ''}`;
    case 'quizzes': return '#/luyen-de';
    case 'profile': return '#/toi';
    case 'settings': return '#/cai-dat';
    default: return '#/';
  }
}

export const route: Route = $state(typeof location !== 'undefined' ? parseHash(location.hash) : HOME);

export function go(name: RouteName, params: Record<string, string> = {}): void {
  location.hash = hashFor(name, params);
}

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const r = parseHash(location.hash);
    const apply = () => {
      route.name = r.name; route.params = r.params; flushSync(); window.scrollTo(0, 0);
      // Chờ Svelte cập nhật DOM rồi chuyển focus tới tiêu đề màn mới (WCAG 2.4.3).
      requestAnimationFrame(() => { void focusRouteHeading(); });
    };
    // Chuyển trang bằng View Transitions (đợt 10): khung điều hướng đứng yên, chỉ vùng nội dung (view-transition-name: page) mờ–trượt.
    // Không hỗ trợ / giảm chuyển động / đổi tham số trong cùng màn (vd. mở khái niệm khác) → đổi ngay như cũ.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
    const reduce = document.documentElement.classList.contains('reduced-motion') || (matchMedia('(prefers-reduced-motion: reduce)').matches && !document.documentElement.classList.contains('motion-on'));
    if (doc.startViewTransition && !reduce && r.name !== route.name) doc.startViewTransition(apply); else apply();
  });
}
