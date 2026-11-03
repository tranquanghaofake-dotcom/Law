import type { Concept, ContentIndex, QuizSet, Subject } from './types';

const BASE = `${import.meta.env.BASE_URL ?? '/'}content/`;

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(BASE + path, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Không tải được ${path} (${r.status})`);
  return (await r.json()) as T;
}

// Nhớ promise theo khoá: nhiều nơi gọi cùng lúc (Hôm nay, sidenav, trang môn…) chỉ ra 1 request.
// Lỗi thì xoá khỏi bộ nhớ để lần sau thử lại.
const memo = new Map<string, Promise<unknown>>();

function once<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit) return hit as Promise<T>;
  const p = load().catch((e: unknown) => {
    if (memo.get(key) === p) memo.delete(key);
    throw e;
  });
  memo.set(key, p);
  return p;
}

/** Xoá bộ nhớ nội dung (dùng trong test). */
export function clearContentCache(): void {
  memo.clear();
}

export const loadIndex = (): Promise<ContentIndex> => once('index', () => getJson<ContentIndex>('index.json'));

export const loadSubject = (id: string): Promise<Subject> =>
  once(`subject:${id}`, () => getJson<Subject>(`subjects/${encodeURIComponent(id)}.json`));

export const loadSet = (id: string): Promise<QuizSet> =>
  once(`set:${id}`, () => getJson<QuizSet>(`sets/${encodeURIComponent(id)}.json`));

function loadConcept(subjectId: string, id: string): Promise<Concept> {
  return once(`concept:${subjectId}/${id}`, () =>
    getJson<Concept>(`concepts/${encodeURIComponent(subjectId)}/${encodeURIComponent(id)}.json`),
  );
}

export const loadConcepts = (subjectId: string, ids: string[]): Promise<Concept[]> =>
  Promise.all(ids.map((id) => loadConcept(subjectId, id)));

/** Bảng tên khái niệm của môn (dist/terms): 1 file thay cho từng `loadConcepts` chỉ để lấy `term`. */
export const loadTerms = (subjectId: string): Promise<Record<string, string>> =>
  once(`terms:${subjectId}`, () => getJson<Record<string, string>>(`terms/${encodeURIComponent(subjectId)}.json`));
