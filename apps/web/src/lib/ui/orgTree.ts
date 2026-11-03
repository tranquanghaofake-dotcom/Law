// Cây chức vụ (Hồ sơ): dựng sơ đồ tổ chức từ dữ liệu career.ts — gốc → 4 nhánh → tầng (cơ sở → lãnh đạo) → chức.
// Chủ tịch nước (đỉnh chung) tách riêng ở `head`. Không tự thêm chức vụ hay khẳng định pháp lý: chỉ sắp xếp lại POSTS.
import { BRANCHES, BRANCH_NAMES, TIER_NAMES, satisfies, totalNeed, type Branch, type CareerState, type Post, type PostTier, type ReqStatus } from '$lib/game/career';

export type OrgStatus = 'done' | 'next' | 'locked';
export type OrgPost = {
  id: string; title: string; tier: PostTier; branch: Branch | 'nguyen-thu'; status: OrgStatus; post: Post;
  /** Số sách đang đáp ứng / cần (mỗi điều kiện tính tối đa bằng số cần). */
  have: number; need: number; detail: ReqStatus[];
  /** Chức liền trước trong nhánh (null nếu là chức đầu hoặc đỉnh chung). */
  prev: string | null;
  /** Chỉ có ở đỉnh chung: số nhánh đã tới cấp yêu cầu / cần. */
  branchesReached?: number; branchesNeeded?: number; branchesTier?: PostTier;
};
export type OrgTier = { tier: PostTier; label: string; posts: OrgPost[]; done: number };
export type OrgBranch = { branch: Branch; label: string; tiers: OrgTier[]; done: number; total: number };
export type OrgTree = { label: string; done: number; total: number; head: OrgPost | null; branches: OrgBranch[] };

export const ROOT_LABEL = 'Nhà nước Cộng hòa xã hội chủ nghĩa Việt Nam';
const TIER_ORDER: readonly PostTier[] = ['co-so', 'tinh', 'trung-uong', 'lanh-dao'];
type Books = Parameters<typeof satisfies>[1];

export function orgTree(posts: readonly Post[], state: CareerState, books: Books = []): OrgTree {
  const make = (p: Post, status: OrgStatus): OrgPost => {
    const detail = satisfies(p.reqs, books).detail;
    return { id: p.id, title: p.title, tier: p.tier, branch: p.branch, status, post: p, detail, need: totalNeed(p), prev: null, have: detail.reduce((n, d) => n + Math.min(d.have, d.req.count), 0) };
  };
  const branches: OrgBranch[] = BRANCHES.map((b) => {
    const mine = posts.filter((p) => p.branch === b);
    const nextId = state.next[b]?.post.id;
    const tiers: OrgTier[] = TIER_ORDER
      .map((tier) => {
        const ps = mine.filter((p) => p.tier === tier).map((p) => make(p, state.achieved.has(p.id) ? 'done' : p.id === nextId ? 'next' : 'locked'));
        return { tier, label: TIER_NAMES[tier], posts: ps, done: ps.filter((p) => p.status === 'done').length };
      })
      .filter((t) => t.posts.length > 0);
    tiers.flatMap((t) => t.posts).forEach((p, i, all) => { p.prev = i > 0 ? all[i - 1].title : null; });
    return { branch: b, label: BRANCH_NAMES[b], tiers, done: tiers.reduce((n, t) => n + t.done, 0), total: mine.length };
  });
  const top = posts.find((p) => p.branch === 'nguyen-thu') ?? null;
  let head: OrgPost | null = null;
  if (top) {
    const need = top.branchesAtTier;
    const rank = (t: PostTier) => TIER_ORDER.indexOf(t);
    const reached = need ? BRANCHES.filter((b) => { const h = state.highest[b]; return !!h && rank(h.tier) >= rank(need.tier); }).length : 0;
    const done = state.achieved.has(top.id);
    head = { ...make(top, done ? 'done' : state.head?.branchOk ? 'next' : 'locked'), branchesReached: reached, branchesNeeded: need?.count ?? 0, branchesTier: need?.tier };
  }
  return { label: ROOT_LABEL, done: branches.reduce((n, b) => n + b.done, 0) + (head?.status === 'done' ? 1 : 0), total: posts.length, head, branches };
}

/** Viết tắt thông dụng của tên cơ quan, dùng cho ô chức vụ trên cây (ô hẹp). Tên đầy đủ vẫn ở tooltip và hộp chi tiết. */
const ABBR: [RegExp, string][] = [
  [/Ủy ban Thường vụ Quốc hội/g, 'UBTVQH'],
  [/Ủy ban nhân dân/g, 'UBND'],
  [/Hội đồng nhân dân/g, 'HĐND'],
  [/Tòa án nhân dân/g, 'TAND'],
  [/Viện kiểm sát nhân dân/g, 'VKSND'],
];

export function shortPostTitle(title: string): string {
  return ABBR.reduce((t, [re, s]) => t.replace(re, s), title);
}
