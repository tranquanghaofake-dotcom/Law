import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { DATA_DIR } from '../src/build';

// Quy cách ghi căn cứ pháp lý (CCPL) — chuyển từ scripts/lint_ccpl.py của skill vn-legal-exam-analysis
// (CCPL01 viết hoa giữa câu, CCPL03 trật tự ngược, CCPL07 dẫn VBHN làm căn cứ).
// Chỉ soát chữ do người soạn: bỏ `definition` và `text` của cloze (nguyên văn luật), `note`, `url`.

const SKIP = new Set(['definition', 'text', 'note', 'url', 'id', 'subject', 'chapter', 'checked']);

/** "Khoản"/"Điểm" viết hoa chỉ được đứng đầu câu (Nghị định 30/2020/NĐ-CP). */
export function hoaGiuaCau(s: string): string[] {
  const out: string[] = [];
  for (const m of s.matchAll(/(?<![\p{L}\d])(?:Khoản|Điểm)\s+(?:\d+|[a-zđ](?![\p{L}]))/gu)) {
    const pre = s.slice(0, m.index).replace(/[\s*_"“‘'(\[-]+$/u, '');
    if (pre === '' || /[.!?:;…]$/u.test(pre)) continue;
    out.push(s.slice(Math.max(0, m.index! - 30), m.index! + 20));
  }
  return out;
}

const SO = String.raw`[\dđa-z]+(?:\s*[–-]\s*\d+)?`;
const DANH_SACH = new RegExp(String.raw`^(?:khoản|điểm)\s+${SO}(?:\s*(?:,|và)\s*(?:khoản\s+|điểm\s+)?${SO})*\s+(?:khoản\s+\d+\s+)?Điều\b`, 'u');

/** "Điều 51 khoản 2" là trật tự ngược; "Điều 26, khoản 3 Điều 35" là liệt kê hai căn cứ, không tính. */
export function tratTuNguoc(s: string): string[] {
  const out: string[] = [];
  for (const m of s.matchAll(/(?<![\p{L}])Điều\s+\d+[a-z]?(,?)\s+(?=khoản\s+\d|điểm\s+[a-zđ](?![\p{L}]))/gu)) {
    const sau = s.slice(m.index! + m[0].length);
    if (DANH_SACH.test(sau)) continue;
    out.push(s.slice(m.index!, m.index! + m[0].length + 15));
  }
  return out;
}

/** VBHN không phải văn bản quy phạm pháp luật: không gắn "(VBHN …)" vào tên luật trong cite/basis,
 * không dùng "theo VBHN" làm căn cứ. Ghi vết đối chiếu ("đã khớp nguyên văn văn bản hợp nhất …") thì được. */
export function vbhnLamCanCu(key: string, s: string): boolean {
  if ((key === 'cite' || key === 'basis') && /\((?:VBHN|Văn bản hợp nhất)\b/u.test(s)) return true;
  return /(?:^|[^\p{L}])(?:theo|căn cứ)\s+(?:VBHN|văn bản hợp nhất)\b/iu.test(s);
}

describe('luật quy cách CCPL', () => {
  it('viết hoa Khoản/Điểm giữa câu', () => {
    expect(hoaGiuaCau('Theo Khoản 2 Điều 5 Bộ luật Dân sự 2015 thì đúng.')).toHaveLength(1);
    expect(hoaGiuaCau('Khoản 2 Điều 5 quy định như vậy.')).toHaveLength(0);
    expect(hoaGiuaCau('Đúng. Điểm a khoản 1 Điều 5 cho phép.')).toHaveLength(0);
    expect(hoaGiuaCau('Hai nhóm (khoản 1); Khoản 3: tội vô ý.')).toHaveLength(0);
    expect(hoaGiuaCau('Theo Điểm yếu của lập luận này.')).toHaveLength(0);
  });
  it('trật tự ngược, trừ liệt kê nhiều căn cứ', () => {
    expect(tratTuNguoc('Theo Điều 51 khoản 2 Luật Thương mại 2005.')).toHaveLength(1);
    expect(tratTuNguoc('Điều 2, khoản 7.')).toHaveLength(1);
    expect(tratTuNguoc('Căn cứ Điều 26, khoản 3 Điều 35 Bộ luật Tố tụng dân sự 2015.')).toHaveLength(0);
    expect(tratTuNguoc('Điều 609, khoản 1, khoản 2 Điều 611 Bộ luật Dân sự 2015')).toHaveLength(0);
    expect(tratTuNguoc('Điều 4, khoản 4, 5 Điều 5, khoản 6 Điều 19.')).toHaveLength(0);
    expect(tratTuNguoc('Khoản 1 Điều 88, khoản 1–2 Điều 92 Luật Thương mại 2005')).toHaveLength(0);
    expect(tratTuNguoc('Điều 147, điểm b khoản 1 Điều 228')).toHaveLength(0);
  });
  it('VBHN làm căn cứ', () => {
    expect(vbhnLamCanCu('cite', 'Điều 3 Luật Đất đai 2024 (VBHN 44/VBHN-VPQH 2026)')).toBe(true);
    expect(vbhnLamCanCu('explain', 'Theo VBHN 44/VBHN-VPQH 2026: có hiệu lực từ 01/8/2024.')).toBe(true);
    expect(vbhnLamCanCu('explain', 'Câu chữ trên lấy từ văn bản hợp nhất (VBHN 160/2026/VBHN-LQ-VPQH).')).toBe(false);
    expect(vbhnLamCanCu('cite', 'Điều 3 Luật Đất đai 2024 (sửa đổi, bổ sung năm 2024, 2025)')).toBe(false);
    expect(vbhnLamCanCu('cite', 'Nghị định 63/2010/NĐ-CP, khoản 1 Điều 3 — đã khớp nguyên văn Văn bản hợp nhất 10272/VBHN-VPCP')).toBe(false);
  });
});

function* jsonFiles(dir: string): Generator<string> {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) yield* jsonFiles(p);
    else if (n.endsWith('.json')) yield p;
  }
}

function* strings(v: unknown, key = ''): Generator<[string, string]> {
  if (typeof v === 'string') { if (!SKIP.has(key)) yield [key, v]; }
  else if (Array.isArray(v)) for (const x of v) yield* strings(x, key);
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) yield* strings(x, k);
}

describe('chặn tái phạm quy cách CCPL trên toàn kho', () => {
  const hoa: string[] = [], nguoc: string[] = [], vbhn: string[] = [];
  for (const dir of ['concepts', 'sets']) for (const f of jsonFiles(join(DATA_DIR, dir))) {
    const rel = relative(DATA_DIR, f);
    for (const [k, s] of strings(JSON.parse(readFileSync(f, 'utf8')))) {
      for (const x of hoaGiuaCau(s)) hoa.push(`${rel}#${k}: ${x}`);
      for (const x of tratTuNguoc(s)) nguoc.push(`${rel}#${k}: ${x}`);
      if (vbhnLamCanCu(k, s)) vbhn.push(`${rel}#${k}: ${s.slice(0, 80)}`);
    }
  }
  it('không viết hoa "Khoản"/"Điểm" giữa câu', () => expect(hoa).toEqual([]));
  it('không viết trật tự ngược (Điều → khoản → điểm)', () => expect(nguoc).toEqual([]));
  it('không dẫn văn bản hợp nhất làm căn cứ', () => expect(vbhn).toEqual([]));
});
