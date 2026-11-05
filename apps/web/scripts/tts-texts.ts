// Gom MỌI câu app có thể đọc bằng giọng dựng sẵn — dùng chính code sinh câu hỏi/lời phản hồi của app (không đoán lại bằng Python),
// để mp3 phủ cả câu sinh tự động (giải thích "Đây là định nghĩa…", "Đáp án: …"). Kết quả: JSON mảng câu, đưa vào tools/tts/gen.py --texts.
// Chạy: npm run tts:texts -w @luyen-luat/web   (ghi ra TTS_TEXTS hoặc <gốc repo>/.tts-texts.json)
import { it } from 'vitest';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Concept, Level } from '$lib/content/types';
import { buildLearnSession, buildReviewSession } from '$lib/engine/session';
import { mulberry32 } from '$lib/engine/rng';
import { feedbackSpeech, promptSpeech } from '$lib/ui/session/speech';
import { sentences } from '$lib/fx/prosody';

const SEEDS = [1, 2, 3, 4];

it('gom câu cho giọng đọc dựng sẵn', () => {
  const root = resolve(__dirname, '../../../packages/content/dist');
  const out = new Set<string>(['Chính xác.', 'Chưa đúng.', 'Phương án A.', 'Phương án B.', 'Phương án C.', 'Phương án D.']);
  const add = (t: string) => sentences(t).forEach((s) => out.add(s));
  for (const sub of readdirSync(`${root}/concepts`)) {
    const dir = `${root}/concepts/${sub}`;
    const all: Concept[] = readdirSync(dir).map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));
    let terms: Record<string, Record<string, string>> = {};
    try { terms = JSON.parse(readFileSync(`${root}/terms/${sub}.json`, 'utf8')); } catch { /* môn chưa có bảng tên */ }
    // thẻ khái niệm đầu: tên + định nghĩa + mẹo nhớ (đọc ngay khi thẻ hiện)
    for (const c of all) add(promptSpeech({ type: 'intro' }, c));
    // đáp của tình huống hỏi–đáp (đọc khi bấm "Xem đáp")
    for (const c of all) if (c.memo?.case) add(`Đáp: ${c.memo.case.a}`);
    const steps = [];
    for (const seed of SEEDS) {
      for (let lv = 1; lv <= 6; lv++) {
        const levels = Object.fromEntries(all.map((c) => [c.id, lv as Level]));
        steps.push(...buildReviewSession(all, levels, mulberry32(seed * 97 + lv), 9999, { terms }));
      }
      for (const lv of [0, 2, 4] as Level[]) steps.push(...buildLearnSession(all, Object.fromEntries(all.map((c) => [c.id, lv])), mulberry32(seed * 131 + lv), { terms }));
    }
    for (const st of steps) {
      if (st.item.type === 'intro') continue;
      // đọc đề khi thẻ hiện (thứ tự phương án không ảnh hưởng: mỗi phương án là một câu riêng)
      const c = all.find((x) => x.id === st.conceptId);
      if (c) add(promptSpeech(st.item, c));
      add(feedbackSpeech(st.item, { correct: true }));
      add(feedbackSpeech(st.item, { correct: false }));
      if (st.item.type === 'recall') add(st.item.model);
    }
  }
  // Bộ đề 10 câu (Quiz10): trắc nghiệm có giải thích
  for (const f of readdirSync(`${root}/sets`)) {
    const set = JSON.parse(readFileSync(`${root}/sets/${f}`, 'utf8')) as { questions?: { q: string; options: string[]; answer?: number; answerIdx?: number; explain?: string }[] };
    for (const q of set.questions ?? []) {
      const answer = q.answerIdx ?? q.answer ?? 0;
      for (const correct of [true, false]) add(feedbackSpeech({ type: 'mcq', level: 1, q: q.q, options: q.options, answer, explain: q.explain ?? '' } as never, { correct }));
    }
  }
  const file = process.env.TTS_TEXTS ?? resolve(__dirname, '../../../.tts-texts.json');
  writeFileSync(file, JSON.stringify([...out]));
  console.log(`tts:texts — ${out.size} câu → ${file}`);
});
