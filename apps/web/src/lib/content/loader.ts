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

/** Mọi môn trong 1 file (dist/subjects.json): Hôm nay, Môn học, thanh bên đều cần đủ các môn — 1 request thay vì 25. */
export const loadSubjects = (): Promise<Subject[]> => once('subjects', () => getJson<Subject[]>('subjects.json'));

/** Một môn: lấy từ file gộp; file gộp lỗi hoặc không có môn này thì hỏi file lẻ của môn (không có thì báo lỗi như trước). */
export const loadSubject = (id: string): Promise<Subject> =>
  once(`subject:${id}`, async () => {
    const all = await loadSubjects().catch(() => null);
    return all?.find((s) => s.id === id) ?? getJson<Subject>(`subjects/${encodeURIComponent(id)}.json`);
  });

export const loadSet = (id: string): Promise<QuizSet> =>
  once(`set:${id}`, () => getJson<QuizSet>(`sets/${encodeURIComponent(id)}.json`));

function loadConcept(subjectId: string, id: string): Promise<Concept> {
  return once(`concept:${subjectId}/${id}`, () =>
    getJson<Concept>(`concepts/${encodeURIComponent(subjectId)}/${encodeURIComponent(id)}.json`),
  );
}

export const loadConcepts = (subjectId: string, ids: string[]): Promise<Concept[]> =>
  Promise.all(ids.map((id) => loadConcept(subjectId, id)));

/**
 * Đợt 6: nạp thêm khái niệm làm phương án nhiễu cho phiên học. Khái niệm lỗi/không còn (404) thì bỏ qua,
 * không làm hỏng phiên. Dùng chung bộ nhớ với `loadConcepts` (không tải lại khái niệm đã có).
 */
export async function loadConceptPool(subjectId: string, ids: string[]): Promise<Concept[]> {
  const r = await Promise.allSettled(ids.map((id) => loadConcept(subjectId, id)));
  return r.flatMap((x) => (x.status === 'fulfilled' ? [x.value] : []));
}

/**
 * Mọi khái niệm của môn trong 1 file (dist/bundles): dùng cho trang Khái niệm thay vì ~100 request lẻ.
 * Nạp xong thì ghi sẵn từng khái niệm vào bộ nhớ, để `loadConcepts`/`loadConceptPool` sau đó không tải lại.
 */
export const loadSubjectConcepts = (subjectId: string): Promise<Concept[]> =>
  once(`bundle:${subjectId}`, async () => {
    const all = await getJson<Concept[]>(`bundles/${encodeURIComponent(subjectId)}.json`);
    for (const c of all) {
      const key = `concept:${subjectId}/${c.id}`;
      if (!memo.has(key)) memo.set(key, Promise.resolve(c));
    }
    return all;
  });

/** Bảng tên khái niệm của môn (dist/terms): 1 file thay cho từng `loadConcepts` chỉ để lấy `term`. */
export const loadTerms = (subjectId: string): Promise<Record<string, string>> =>
  once(`terms:${subjectId}`, () => getJson<Record<string, string>>(`terms/${encodeURIComponent(subjectId)}.json`));

/** Bảng tên của mọi môn (tìm khái niệm liên môn). Môn nào lỗi tải thì để trống, không làm hỏng cả bảng. */
export const loadTermIndex = (): Promise<{ id: string; short: string; terms: Record<string, string> }[]> =>
  once('terms:all', async () => {
    const ix = await loadIndex();
    const all = await Promise.allSettled(ix.subjects.map((s) => loadTerms(s.id)));
    return ix.subjects.map((s, i) => { const r = all[i]; return { id: s.id, short: s.short, terms: r.status === 'fulfilled' ? r.value : {} }; });
  });
