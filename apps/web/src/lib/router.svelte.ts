export type RouteName = 'home' | 'subjects' | 'subject' | 'concepts' | 'quizzes' | 'lesson' | 'review' | 'quiz' | 'profile' | 'settings';
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
  return HOME;
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
    route.name = r.name;
    route.params = r.params;
    window.scrollTo(0, 0);
  });
}
