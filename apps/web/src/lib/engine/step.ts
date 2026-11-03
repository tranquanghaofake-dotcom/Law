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

export type StepGen = 'def-term' | 'term-def' | 'example-concept' | 'pair-merged' | 'match';
export type StepMeta = {
  /** Dạng sinh tự động. Với 'def-term' / 'example-concept' giao diện KHÔNG được hiện tên khái niệm ở kicker (lộ đáp án). */
  gen?: StepGen;
  /** Nhãn ngắn trên thẻ, ví dụ "Định nghĩa → thuật ngữ". */
  kicker?: string;
  /** Câu vàng: XP ×2 (runner tính), giao diện làm nổi bật. */
  golden?: boolean;
  /** 'retry' = vòng sửa sai cuối phiên: KHÔNG ghi tiến độ (repo.record), KHÔNG đổi bậc; 'boss' = câu chốt cuối phiên. */
  kind?: 'learn' | 'retry' | 'boss';
};

export type Step = { conceptId: string; item: StepItem; level: Level; meta?: StepMeta };
