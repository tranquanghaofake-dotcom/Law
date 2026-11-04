// Nút "Quay lại": trang cha hợp lý của từng route + bộ theo dõi lịch sử trong app (hash router).
// Có lịch sử trong app → history.back(); mở thẳng một trang con (dán link, tải lại) → về trang cha.
import type { Route } from '$lib/router.svelte';
import { hashFor } from '$lib/router.svelte';

/** Hash của trang cha; null với 4 trang gốc của thanh điều hướng (không có nút quay lại). */
export function parentHash(r: Route): string | null {
  switch (r.name) {
    case 'home': case 'subjects': case 'quizzes': case 'profile': return null;
    case 'subject': return hashFor('subjects');
    case 'concepts': return r.params.concept ? hashFor('concepts', { subject: r.params.subject }) : hashFor('subject', { subject: r.params.subject });
    case 'lesson': return hashFor('subject', { subject: r.params.subject });
    case 'review': return r.params.subject ? hashFor('subject', { subject: r.params.subject }) : hashFor('home');
    case 'quiz': return hashFor('quizzes');
    case 'settings': return hashFor('profile');
    default: return hashFor('home');
  }
}

/** Ngăn xếp hash đã đi qua trong phiên app. Đi tới hash trước đó (nút lùi của trình duyệt) thì bỏ phần tử cuối; còn lại thì thêm. */
export function createBackTracker(first: string) {
  const stack = [first];
  return {
    visit(hash: string) {
      if (hash === stack[stack.length - 1]) return;
      if (stack.length > 1 && stack[stack.length - 2] === hash) stack.pop(); else stack.push(hash);
    },
    canGoBack: () => stack.length > 1,
    get depth() { return stack.length; },
  };
}

/** Theo dõi toàn app (nạp cùng Shell lúc khởi động). */
const tracker = createBackTracker(typeof location !== 'undefined' ? location.hash || '#/' : '#/');
if (typeof window !== 'undefined') window.addEventListener('hashchange', () => tracker.visit(location.hash || '#/'));

/** Quay lại: lịch sử trong app thì lùi một bước; không thì về trang cha. */
export function goBack(r: Route): void {
  if (tracker.canGoBack()) { history.back(); return; }
  const p = parentHash(r);
  if (p) location.hash = p;
}
