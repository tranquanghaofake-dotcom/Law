// Hợp đồng chung đợt 6 giữa engine sinh câu (lib/engine) và giao diện phiên học (lib/ui).
// Được THÊM trường tùy chọn; đổi tên/xoá trường phải báo người điều phối (hai phía làm song song).
import type { Item, Level } from '$lib/content/types';

export type IntroItem = { type: 'intro' };

/** Ghép cặp nhanh n thuật ngữ ↔ n mô tả (mô tả lấy từ dữ liệu đã kiểm: `plain` hoặc `definition`). Sinh tự động, không có trong JSON. */
export type MatchItem = {
  type: 'match';
  level: 2;
  pairs: { conceptId: string; term: string; text: string }[];
  explain: string;
};

/** Phân biệt kiểu xếp tình huống vào hai cột: gộp tình huống từ các câu `pair` cùng cặp nhãn, ≥ 4 tình huống, không buộc cân 50/50. */
export type SortItem = {
  type: 'sort';
  level: 2;
  left: string;
  right: string;
  cases: { text: string; answer: 'left' | 'right'; conceptId?: string }[];
  explain: string;
};

export type GenItem = MatchItem | SortItem;
/** Mọi thứ một bước có thể hiển thị. Câu sinh tự động kiểu trắc nghiệm dùng lại `ItemMcq` (type 'mcq'), phân biệt bằng `meta.gen`. */
export type StepItem = Item | IntroItem | GenItem;

/** (đợt 6, thêm 'def-tf') 'def-tf' = câu Đúng/Sai sinh từ định nghĩa: item là `ItemTrueFalse` "«định nghĩa» là định nghĩa của «thuật ngữ»". */
export type StepGen = 'def-term' | 'term-def' | 'example-concept' | 'pair-merged' | 'match' | 'def-tf';
export type StepMeta = {
  /** Dạng sinh tự động. Với 'def-term' / 'example-concept' giao diện KHÔNG được hiện tên khái niệm ở kicker (lộ đáp án). */
  gen?: StepGen;
  /** Nhãn ngắn trên thẻ, ví dụ "Định nghĩa → thuật ngữ". */
  kicker?: string;
  /** Câu vàng: XP ×2 (runner tính), giao diện làm nổi bật. */
  golden?: boolean;
  /** 'retry' = vòng sửa sai cuối phiên: KHÔNG ghi tiến độ (repo.record), KHÔNG đổi bậc; 'boss' = câu chốt cuối phiên.
   *  (đợt 7, thêm) 'pretest' = đoán trước khi học khái niệm mới: KHÔNG ghi tiến độ, KHÔNG đổi bậc, không XP, không combo,
   *  không vào vòng sửa sai, có thể "Bỏ qua" (trả lời sai cũng không sao). Xem `recordsProgress`. */
  kind?: 'learn' | 'retry' | 'boss' | 'pretest';
  /** (đợt 6, thêm) Bước retry: chỉ số của bước gốc trong `steps` (để giao diện ghi "Sửa câu …"). */
  retryOf?: number;
};

export type Step = { conceptId: string; item: StepItem; level: Level; meta?: StepMeta };

/** (đợt 7) Bước có ghi tiến độ (repo.record) và đổi bậc không: không với intro, vòng sửa sai, đoán trước. */
export function recordsProgress(step: Step): boolean {
  return step.item.type !== 'intro' && step.meta?.kind !== 'retry' && step.meta?.kind !== 'pretest';
}
