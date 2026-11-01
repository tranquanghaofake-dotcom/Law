import type { Concept, ContentIndex, QuizSet, Subject } from './types';

const BASE = `${import.meta.env.BASE_URL ?? '/'}content/`;

async function getJson<T>(path: string): Promise<T> {
  const r = await fetch(BASE + path, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`Không tải được ${path} (${r.status})`);
  return (await r.json()) as T;
}

export const loadIndex = () => getJson<ContentIndex>('index.json');
export const loadSubject = (id: string) => getJson<Subject>(`subjects/${encodeURIComponent(id)}.json`);
export const loadSet = (id: string) => getJson<QuizSet>(`sets/${encodeURIComponent(id)}.json`);
export const loadConcepts = (subjectId: string, ids: string[]) =>
  Promise.all(ids.map((id) => getJson<Concept>(`concepts/${encodeURIComponent(subjectId)}/${encodeURIComponent(id)}.json`)));
