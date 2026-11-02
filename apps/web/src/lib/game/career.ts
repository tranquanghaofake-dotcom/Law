// Thăng chức theo bộ máy nhà nước (spec thăng chức §3). Căn cứ: Hiến pháp 2013 sửa đổi bởi NQ 203/2025/QH15 —
// chính quyền địa phương hai cấp (Điều 110), Chính phủ (Điều 95), TAND và VKSND gồm cấp tối cao và cấp khác do luật định (Điều 102, 107).
// Chức danh mô phỏng trong trò chơi học tập, không phải chức vụ thật. Tên cấp toà án/viện kiểm sát dưới tối cao chưa đối chiếu luật tổ chức ngành:
// dùng tên chung ("Thẩm phán", "Kiểm sát viên") thay vì gọi tên cấp toà.
import type { BookLevel } from './books';
import { FUTURE_FIELDS, FIELD_NAMES, type Field } from './fields';

export type Branch = 'hanh-phap' | 'lap-phap' | 'xet-xu' | 'kiem-sat';
export type PostTier = 'co-so' | 'tinh' | 'trung-uong' | 'lanh-dao';
export type Req = { field: Field | 'any'; level: 1 | 2 | 3; count: number };
export type Post = { id: string; title: string; branch: Branch | 'nguyen-thu'; tier: PostTier; reqs: Req[]; branchesAtTier?: { tier: PostTier; count: number } };

export const BRANCHES: readonly Branch[] = ['hanh-phap', 'lap-phap', 'xet-xu', 'kiem-sat'];
export const BRANCH_NAMES: Record<Branch, string> = { 'hanh-phap': 'Hành pháp & chính quyền địa phương', 'lap-phap': 'Lập pháp & cơ quan dân cử', 'xet-xu': 'Xét xử (Tòa án)', 'kiem-sat': 'Kiểm sát (Viện kiểm sát)' };
export const TIER_NAMES: Record<PostTier, string> = { 'co-so': 'Cơ sở', tinh: 'Cấp tỉnh', 'trung-uong': 'Trung ương', 'lanh-dao': 'Lãnh đạo cấp cao' };
const TIER_RANK: Record<PostTier, number> = { 'co-so': 0, tinh: 1, 'trung-uong': 2, 'lanh-dao': 3 };

const r = (field: Field | 'any', level: 1 | 2 | 3, count = 1): Req => ({ field, level, count });

export const POSTS: Post[] = [
  // Hành pháp — từ chính quyền cấp xã, qua sở/tỉnh, lên bộ và Chính phủ
  { id: 'cong-chuc-xa', title: 'Công chức cấp xã', branch: 'hanh-phap', tier: 'co-so', reqs: [r('dia-phuong', 1), r('hien-phap', 1)] },
  { id: 'pho-chu-tich-xa', title: 'Phó Chủ tịch Ủy ban nhân dân cấp xã', branch: 'hanh-phap', tier: 'co-so', reqs: [r('dia-phuong', 1), r('hien-phap', 1, 2), r('quyen-cong-dan', 1), r('any', 1, 2)] },
  { id: 'chu-tich-xa', title: 'Chủ tịch Ủy ban nhân dân cấp xã', branch: 'hanh-phap', tier: 'co-so', reqs: [r('dia-phuong', 2), r('hien-phap', 2, 2), r('quyen-cong-dan', 1, 2), r('hanh-phap', 1), r('any', 1, 4)] },
  { id: 'chuyen-vien-so', title: 'Chuyên viên sở', branch: 'hanh-phap', tier: 'tinh', reqs: [r('hanh-chinh', 2, 2), r('dia-phuong', 2), r('hanh-phap', 2), r('hien-phap', 2, 3), r('any', 2, 8)] },
  { id: 'giam-doc-so', title: 'Giám đốc sở', branch: 'hanh-phap', tier: 'tinh', reqs: [r('hanh-chinh', 3, 2), r('dia-phuong', 3), r('hanh-phap', 2), r('hien-phap', 2, 3), r('kinh-te-tai-chinh', 2, 3), r('any', 2, 10)] },
  { id: 'chu-tich-tinh', title: 'Chủ tịch Ủy ban nhân dân cấp tỉnh', branch: 'hanh-phap', tier: 'tinh', reqs: [r('hanh-chinh', 3, 3), r('dat-dai', 2, 2), r('dia-phuong', 3), r('hanh-phap', 3), r('hien-phap', 3, 2), r('kinh-te-tai-chinh', 2, 5), r('any', 2, 16)] },
  { id: 'vu-truong', title: 'Vụ trưởng', branch: 'hanh-phap', tier: 'trung-uong', reqs: [r('hanh-chinh', 3, 4), r('hanh-phap', 3), r('hien-phap', 3, 3), r('kinh-te-tai-chinh', 3, 4), r('any', 3, 20)] },
  { id: 'thu-truong', title: 'Thứ trưởng', branch: 'hanh-phap', tier: 'trung-uong', reqs: [r('hanh-chinh', 3, 6), r('hanh-phap', 3), r('hien-phap', 3, 3), r('kinh-te-tai-chinh', 3, 6), r('quyen-cong-dan', 3, 2), r('any', 3, 18)] },
  { id: 'bo-truong', title: 'Bộ trưởng', branch: 'hanh-phap', tier: 'trung-uong', reqs: [r('hanh-chinh', 3, 8), r('hanh-phap', 3), r('nguyen-thu', 3), r('hien-phap', 3, 3), r('kinh-te-tai-chinh', 3, 8), r('quyen-cong-dan', 3, 2), r('any', 3, 26)] },
  { id: 'pho-thu-tuong', title: 'Phó Thủ tướng Chính phủ', branch: 'hanh-phap', tier: 'lanh-dao', reqs: [r('hanh-chinh', 3, 9), r('hanh-phap', 3), r('nguyen-thu', 3), r('lap-phap', 3), r('tu-phap', 3), r('hien-phap', 3, 3), r('kinh-te-tai-chinh', 3, 9), r('quyen-cong-dan', 3, 2), r('dat-dai', 3, 3), r('lao-dong', 3, 2), r('any', 3, 30)] },
  { id: 'thu-tuong', title: 'Thủ tướng Chính phủ', branch: 'hanh-phap', tier: 'lanh-dao', reqs: [r('hanh-chinh', 3, 10), r('hanh-phap', 3), r('nguyen-thu', 3), r('lap-phap', 3), r('tu-phap', 3), r('dia-phuong', 3), r('hien-phap', 3, 3), r('quyen-cong-dan', 3, 2), r('kinh-te-tai-chinh', 3, 10), r('dat-dai', 3, 4), r('lao-dong', 3, 3), r('dan-su', 3, 3), r('any', 3, 45)] },
  // Lập pháp — từ đại biểu Hội đồng nhân dân lên Quốc hội
  { id: 'dai-bieu-hdnd-xa', title: 'Đại biểu Hội đồng nhân dân cấp xã', branch: 'lap-phap', tier: 'co-so', reqs: [r('bau-cu', 1), r('dia-phuong', 1)] },
  { id: 'dai-bieu-hdnd-tinh', title: 'Đại biểu Hội đồng nhân dân cấp tỉnh', branch: 'lap-phap', tier: 'tinh', reqs: [r('bau-cu', 2), r('dia-phuong', 2), r('quyen-cong-dan', 2, 2), r('hien-phap', 2, 3), r('lap-phap', 2), r('any', 2, 7)] },
  { id: 'dai-bieu-quoc-hoi', title: 'Đại biểu Quốc hội', branch: 'lap-phap', tier: 'trung-uong', reqs: [r('bau-cu', 3), r('lap-phap', 3), r('hien-phap', 3, 3), r('quyen-cong-dan', 3, 2), r('dia-phuong', 3), r('any', 3, 10)] },
  { id: 'uy-vien-ubtvqh', title: 'Ủy viên Ủy ban Thường vụ Quốc hội', branch: 'lap-phap', tier: 'trung-uong', reqs: [r('lap-phap', 3), r('hien-phap', 3, 3), r('bau-cu', 3), r('nguyen-thu', 3), r('hanh-phap', 3), r('tu-phap', 3), r('quyen-cong-dan', 3, 2), r('hanh-chinh', 3, 2), r('any', 3, 14)] },
  { id: 'pho-chu-tich-qh', title: 'Phó Chủ tịch Quốc hội', branch: 'lap-phap', tier: 'lanh-dao', reqs: [r('lap-phap', 3), r('hien-phap', 3, 3), r('bau-cu', 3), r('nguyen-thu', 3), r('hanh-phap', 3), r('tu-phap', 3), r('quyen-cong-dan', 3, 2), r('hanh-chinh', 3, 3), r('dan-su', 3, 2), r('hinh-su', 3, 2), r('any', 3, 22)] },
  { id: 'chu-tich-qh', title: 'Chủ tịch Quốc hội', branch: 'lap-phap', tier: 'lanh-dao', reqs: [r('lap-phap', 3), r('hien-phap', 3, 3), r('bau-cu', 3), r('nguyen-thu', 3), r('hanh-phap', 3), r('tu-phap', 3), r('dia-phuong', 3), r('quyen-cong-dan', 3, 2), r('hanh-chinh', 3, 4), r('dan-su', 3, 3), r('hinh-su', 3, 3), r('to-tung', 3, 2), r('any', 3, 30)] },
  // Xét xử
  { id: 'thu-ky-toa-an', title: 'Thư ký Tòa án', branch: 'xet-xu', tier: 'co-so', reqs: [r('tu-phap', 1), r('quyen-cong-dan', 1)] },
  { id: 'tham-tra-vien', title: 'Thẩm tra viên Tòa án', branch: 'xet-xu', tier: 'co-so', reqs: [r('tu-phap', 2), r('quyen-cong-dan', 1, 2), r('hien-phap', 1, 2), r('any', 1, 3)] },
  { id: 'tham-phan', title: 'Thẩm phán', branch: 'xet-xu', tier: 'co-so', reqs: [r('tu-phap', 2), r('dan-su', 2), r('hinh-su', 2), r('to-tung', 2, 2), r('quyen-cong-dan', 2, 2), r('any', 2, 4)] },
  { id: 'chanh-an-tinh', title: 'Chánh án Tòa án nhân dân cấp tỉnh', branch: 'xet-xu', tier: 'tinh', reqs: [r('tu-phap', 3), r('to-tung', 3, 3), r('dan-su', 3, 2), r('hinh-su', 3, 2), r('dia-phuong', 2), r('hien-phap', 2, 3), r('any', 2, 10)] },
  { id: 'tham-phan-tc', title: 'Thẩm phán Tòa án nhân dân tối cao', branch: 'xet-xu', tier: 'trung-uong', reqs: [r('tu-phap', 3), r('to-tung', 3, 5), r('dan-su', 3, 4), r('hinh-su', 3, 4), r('hien-phap', 3, 3), r('quyen-cong-dan', 3, 2), r('any', 3, 14)] },
  { id: 'chanh-an-tc', title: 'Chánh án Tòa án nhân dân tối cao', branch: 'xet-xu', tier: 'lanh-dao', reqs: [r('tu-phap', 3), r('to-tung', 3, 5), r('dan-su', 3, 4), r('hinh-su', 3, 4), r('hien-phap', 3, 3), r('quyen-cong-dan', 3, 2), r('lap-phap', 3), r('nguyen-thu', 3), r('hanh-chinh', 3, 3), r('lao-dong', 3, 2), r('any', 3, 24)] },
  // Kiểm sát
  { id: 'kiem-tra-vien', title: 'Kiểm tra viên', branch: 'kiem-sat', tier: 'co-so', reqs: [r('tu-phap', 1), r('hien-phap', 1)] },
  { id: 'kiem-sat-vien', title: 'Kiểm sát viên', branch: 'kiem-sat', tier: 'co-so', reqs: [r('tu-phap', 2), r('hinh-su', 2, 2), r('to-tung', 2, 2), r('quyen-cong-dan', 2), r('any', 2, 4)] },
  { id: 'vien-truong-tinh', title: 'Viện trưởng Viện kiểm sát nhân dân cấp tỉnh', branch: 'kiem-sat', tier: 'tinh', reqs: [r('tu-phap', 3), r('hinh-su', 3, 3), r('to-tung', 3, 3), r('dia-phuong', 2), r('hien-phap', 2, 3), r('any', 2, 10)] },
  { id: 'kiem-sat-vien-tc', title: 'Kiểm sát viên Viện kiểm sát nhân dân tối cao', branch: 'kiem-sat', tier: 'trung-uong', reqs: [r('tu-phap', 3), r('hinh-su', 3, 5), r('to-tung', 3, 5), r('hien-phap', 3, 3), r('quyen-cong-dan', 3, 2), r('any', 3, 14)] },
  { id: 'vien-truong-tc', title: 'Viện trưởng Viện kiểm sát nhân dân tối cao', branch: 'kiem-sat', tier: 'lanh-dao', reqs: [r('tu-phap', 3), r('hinh-su', 3, 5), r('to-tung', 3, 5), r('hien-phap', 3, 3), r('quyen-cong-dan', 3, 2), r('lap-phap', 3), r('nguyen-thu', 3), r('dan-su', 3, 2), r('any', 3, 24)] },
  // Nguyên thủ quốc gia — đỉnh chung
  { id: 'chu-tich-nuoc', title: 'Chủ tịch nước', branch: 'nguyen-thu', tier: 'lanh-dao', reqs: [r('nguyen-thu', 3), r('hien-phap', 3, 3), r('lap-phap', 3), r('hanh-phap', 3), r('tu-phap', 3), r('quyen-cong-dan', 3, 2), r('any', 3, 50)], branchesAtTier: { tier: 'trung-uong', count: 2 } },
];

export const totalNeed = (p: Post): number => p.reqs.reduce((n, x) => n + x.count, 0);

type BookLike = { field: Field; level: BookLevel };
export type ReqStatus = { req: Req; have: number; future: boolean; label: string };

/** Phân bổ tham lam: điều kiện theo lĩnh vực trước (cấp cao trước), dùng cuốn cấp thấp nhất còn đủ; "bất kỳ" lấy phần còn lại. Mỗi cuốn dùng một lần. */
export function satisfies(reqs: Req[], books: BookLike[]): { ok: boolean; detail: ReqStatus[] } {
  const pool = books.filter((b) => b.level > 0).map((b, i) => ({ ...b, i })).sort((a, b) => a.level - b.level);
  const used = new Set<number>();
  const order = reqs.map((q, i) => ({ q, i })).sort((a, b) => (a.q.field === 'any' ? 1 : 0) - (b.q.field === 'any' ? 1 : 0) || b.q.level - a.q.level);
  const have: number[] = Array(reqs.length).fill(0);
  for (const { q, i } of order) {
    for (const b of pool) {
      if (have[i] >= q.count) break;
      if (used.has(b.i) || b.level < q.level || (q.field !== 'any' && b.field !== q.field)) continue;
      used.add(b.i); have[i]++;
    }
  }
  const detail = reqs.map((q, i) => ({
    req: q, have: have[i], future: q.field !== 'any' && FUTURE_FIELDS.includes(q.field) && have[i] < q.count,
    label: `${q.count} sách ${q.field === 'any' ? 'bất kỳ' : FIELD_NAMES[q.field]} cấp ${q.level}+`,
  }));
  return { ok: detail.every((d) => d.have >= d.req.count), detail };
}

export type CareerState = {
  achieved: Set<string>;
  highest: Record<Branch, Post | null>;
  next: Record<Branch, { post: Post; missing: ReqStatus[] } | null>;
  head: { post: Post; missing: ReqStatus[]; branchOk: boolean } | null;
};

export function careerState(books: BookLike[]): CareerState {
  const achieved = new Set<string>();
  const highest = {} as CareerState['highest'];
  const next = {} as CareerState['next'];
  for (const b of BRANCHES) {
    highest[b] = null; next[b] = null;
    for (const p of POSTS.filter((x) => x.branch === b)) {
      const s = satisfies(p.reqs, books);
      if (!s.ok) { next[b] = { post: p, missing: s.detail.filter((d) => d.have < d.req.count) }; break; }
      achieved.add(p.id); highest[b] = p;
    }
  }
  const ctn = POSTS.find((p) => p.id === 'chu-tich-nuoc') as Post;
  const atTier = BRANCHES.filter((b) => highest[b] && TIER_RANK[(highest[b] as Post).tier] >= TIER_RANK[ctn.branchesAtTier!.tier]).length;
  const branchOk = atTier >= ctn.branchesAtTier!.count;
  const s = satisfies(ctn.reqs, books);
  if (branchOk && s.ok) achieved.add(ctn.id);
  const head = achieved.has(ctn.id) ? null : { post: ctn, missing: s.detail.filter((d) => d.have < d.req.count), branchOk };
  return { achieved, highest, next, head };
}

/** Chức danh hiển thị: Chủ tịch nước nếu đạt; không thì chức cao nhất của nhánh đang chọn; không có thì "Công dân". */
export function displayTitle(state: CareerState, branch: Branch): { title: string; tier: PostTier | null; post: Post | null } {
  if (state.achieved.has('chu-tich-nuoc')) { const p = POSTS.find((x) => x.id === 'chu-tich-nuoc')!; return { title: p.title, tier: p.tier, post: p }; }
  const p = state.highest[branch];
  return p ? { title: p.title, tier: p.tier, post: p } : { title: 'Công dân', tier: null, post: null };
}

/** Chức vừa đạt mà người học chưa xem màn nhận chức. `seen = null` (chưa từng lưu) → không mừng, để chức cũ không bị mừng lại. */
export function promotionToCelebrate(achieved: Set<string>, seen: string[] | null): Post | null {
  if (seen === null) return null;
  const fresh = POSTS.filter((p) => achieved.has(p.id) && !seen.includes(p.id));
  if (!fresh.length) return null;
  return fresh.reduce((a, b) => (TIER_RANK[b.tier] > TIER_RANK[a.tier] || (TIER_RANK[b.tier] === TIER_RANK[a.tier] && POSTS.indexOf(b) > POSTS.indexOf(a)) ? b : a));
}
