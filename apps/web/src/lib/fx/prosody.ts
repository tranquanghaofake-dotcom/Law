// Nhấn nhá cho giọng đọc: tách lời thành cụm ý, mỗi cụm có tốc độ/cao độ/khoảng nghỉ riêng.
// Mẫu tham chiếu: giọng kể "kiến thức xã hội" — chậm, ngắt theo cụm, hạ giọng cuối câu, lên giọng câu hỏi,
// đọc chậm lại ở từ phủ định/bắt buộc. Cao độ giữ trong 0,85–1,2 để không méo thanh điệu tiếng Việt.

export type Phrase = { text: string; rate: number; pitch: number; pauseAfter: number };

const BASE_RATE = 0.95;
const SLOW_RATE = 0.86;
const LONG_PHRASE = 12; // số từ: cụm dài hơn thì ngắt trước từ nối
const CONNECTIVES = new Set(['khi', 'nếu', 'thì', 'nhưng', 'mà', 'để', 'trừ', 'hoặc', 'đồng thời', 'bao gồm', 'trong trường hợp', 'theo quy định']);
const STRONG_WORDS = new Set(['không', 'cấm', 'phải', 'chỉ', 'mọi', 'tuyệt', 'chưa']);
const STRONG_PAIRS = ['bắt buộc', 'duy nhất', 'nghiêm cấm', 'cao nhất'];

const norm = (s: string) => s.normalize('NFC').replace(/\s+/g, ' ').trim();

/** Tách câu theo . ! ? … (giữ dấu). */
export function sentences(text: string): string[] {
  const t = norm(text);
  return t ? t.split(/(?<=[.!?…])\s+/).filter(Boolean) : [];
}

/** Khoá ổn định cho một đoạn lời (FNV-1a 32 bit, hex 8 ký tự) — dùng đặt tên tệp mp3 dựng sẵn. */
export function textKey(text: string): string {
  let h = 0x811c9dc5;
  for (const ch of norm(text)) {
    h ^= ch.codePointAt(0)!;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

const words = (s: string) => s.split(' ');
const bare = (w: string) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/** Ngắt cụm quá dài trước từ nối đầu tiên (sau ít nhất 4 từ). */
function splitLong(chunk: string): string[] {
  const ws = words(chunk);
  if (ws.length <= LONG_PHRASE) return [chunk];
  for (let i = 4; i < ws.length - 2; i++) {
    const one = bare(ws[i]);
    const two = `${one} ${bare(ws[i + 1] ?? '')}`;
    const three = `${two} ${bare(ws[i + 2] ?? '')}`;
    if (CONNECTIVES.has(one) || CONNECTIVES.has(two) || CONNECTIVES.has(three)) {
      return [ws.slice(0, i).join(' '), ...splitLong(ws.slice(i).join(' '))];
    }
  }
  return [chunk];
}

function strong(chunk: string): boolean {
  const ws = words(chunk).map(bare);
  if (ws.some((w) => STRONG_WORDS.has(w))) return true;
  const joined = ws.join(' ');
  return STRONG_PAIRS.some((p) => joined.includes(p));
}

function pauseFor(chunk: string, endOfSentence: boolean): number {
  const last = chunk.at(-1) ?? '';
  if (endOfSentence) return last === '?' || last === '!' ? 560 : 480;
  if (last === ';' || last === ':') return 320;
  if (last === ',') return 200;
  return 120; // ngắt trước từ nối
}

export function phrases(text: string): Phrase[] {
  const out: Phrase[] = [];
  for (const s of sentences(text)) {
    const plain = bare(s.replace(/\s+/g, ''));
    if (plain === 'chínhxác' || plain === 'đúngrồi') { out.push({ text: s, rate: 1, pitch: 1.15, pauseAfter: 380 }); continue; }
    if (plain === 'chưađúng' || plain === 'sairồi') { out.push({ text: s, rate: 0.85, pitch: 0.9, pauseAfter: 420 }); continue; }
    const chunks = s.split(/(?<=[,;:])\s+/).flatMap(splitLong).filter(Boolean);
    const question = /\?$/.test(s);
    chunks.forEach((c, i) => {
      const first = i === 0;
      const last = i === chunks.length - 1;
      const pitch = last ? (question ? 1.12 : chunks.length > 1 ? 0.93 : 0.97) : first ? 1.04 : 1;
      out.push({ text: c, rate: strong(c) ? SLOW_RATE : BASE_RATE, pitch, pauseAfter: pauseFor(c, last) });
    });
  }
  return out;
}
