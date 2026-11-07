// Bản đồ điểm yếu (spec docs/specs/2026-11-07-ban-do-diem-yeu-design.md): gom lượt trả lời gần đây theo bài và theo bậc.
// Thuần — không đụng IndexedDB; đầu vào là các dòng `reviews` (rating 1 = trả lời sai).

export type WeakRow = { conceptId: string; rating: number; level: number; at: number };
export type LessonRef = { subject: string; lesson: string };
export type WeakLesson = LessonRef & { tries: number; correct: number; rate: number };
export type LevelAcc = { level: number; tries: number; correct: number; rate: number };
type Opts = { now: number; days?: number; minTries?: number; limit?: number };

const DAY = 86_400_000;
const recent = (rows: WeakRow[], o: Opts) => rows.filter((r) => r.at >= o.now - (o.days ?? 90) * DAY);

/** Tối đa `limit` (3) bài có tỷ lệ đúng thấp nhất trong 90 ngày, chỉ bài có ≥ `minTries` (5) lượt; hoà thì bài nhiều lượt hơn trước. */
export function weakLessons(rows: WeakRow[], where: (conceptId: string) => LessonRef | undefined, o: Opts): WeakLesson[] {
  const m = new Map<string, WeakLesson>();
  for (const r of recent(rows, o)) {
    const ref = where(r.conceptId);
    if (!ref) continue;
    const k = `${ref.subject}/${ref.lesson}`;
    const g = m.get(k) ?? { ...ref, tries: 0, correct: 0, rate: 0 };
    g.tries += 1;
    if (r.rating !== 1) g.correct += 1;
    m.set(k, g);
  }
  return [...m.values()]
    .filter((g) => g.tries >= (o.minTries ?? 5))
    .map((g) => ({ ...g, rate: g.correct / g.tries }))
    .sort((a, b) => a.rate - b.rate || b.tries - a.tries)
    .slice(0, o.limit ?? 3);
}

/** Tỷ lệ đúng theo bậc lúc trả lời (chỉ bậc có ≥ `minTries` lượt), sắp theo bậc. */
export function accuracyByLevel(rows: WeakRow[], o: Opts): LevelAcc[] {
  const m = new Map<number, LevelAcc>();
  for (const r of recent(rows, o)) {
    const g = m.get(r.level) ?? { level: r.level, tries: 0, correct: 0, rate: 0 };
    g.tries += 1;
    if (r.rating !== 1) g.correct += 1;
    m.set(r.level, g);
  }
  return [...m.values()]
    .filter((g) => g.tries >= (o.minTries ?? 5))
    .map((g) => ({ ...g, rate: g.correct / g.tries }))
    .sort((a, b) => a.level - b.level);
}
