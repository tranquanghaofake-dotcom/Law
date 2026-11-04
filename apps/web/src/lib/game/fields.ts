// Lĩnh vực của sách: mỗi chương gắn một lĩnh vực; chức danh (career.ts) đòi sách theo lĩnh vực.
// Bảng lĩnh vực theo trình tự học phần ngành luật (đợt 9, Task K): năm 1 = Lý luận, Lịch sử, Hiến pháp; năm 2 = Hành chính, Dân sự, Hình sự, Xây dựng VBPL;
// năm 3+ = Tố tụng, Lao động, Đất đai, Thương mại – cạnh tranh – đầu tư, Tài chính – ngân hàng – chứng khoán, SHTT, An sinh xã hội.
// Lĩnh vực nằm trong FUTURE_FIELDS chưa có môn nào — chức danh cần chúng hiện "Chờ môn …".
export const FIELDS = [
  'ly-luan', 'lich-su', 'hien-phap', 'quyen-cong-dan', 'lap-phap', 'bo-may',
  'hanh-chinh', 'dan-su', 'hinh-su', 'to-tung', 'lao-dong', 'dat-dai', 'thuong-mai', 'tai-chinh',
] as const;
export type Field = (typeof FIELDS)[number];

export const FIELD_NAMES: Record<Field, string> = {
  'ly-luan': 'Lý luận nhà nước và pháp luật', 'lich-su': 'Lịch sử nhà nước và pháp luật', 'hien-phap': 'Hiến pháp nền tảng',
  'quyen-cong-dan': 'Quyền công dân và bầu cử', 'lap-phap': 'Lập pháp (Quốc hội, xây dựng VBPL)', 'bo-may': 'Bộ máy nhà nước (Chủ tịch nước, Chính phủ, Tòa án – VKS, địa phương)',
  'hanh-chinh': 'Luật Hành chính', 'dan-su': 'Luật Dân sự – sở hữu trí tuệ', 'hinh-su': 'Luật Hình sự', 'to-tung': 'Luật Tố tụng', 'lao-dong': 'Luật Lao động – an sinh xã hội',
  'dat-dai': 'Luật Đất đai', 'thuong-mai': 'Thương mại – cạnh tranh – đầu tư', 'tai-chinh': 'Tài chính – ngân hàng – chứng khoán',
};

/** Năm học điển hình của lĩnh vực (dùng để kiểm tra chức cơ sở chỉ đòi môn năm 1–2). */
export const FIELD_YEAR: Record<Field, 1 | 2 | 3> = {
  'ly-luan': 1, 'lich-su': 1, 'hien-phap': 1, 'quyen-cong-dan': 1, 'bo-may': 1, 'lap-phap': 2, 'hanh-chinh': 2, 'dan-su': 2, 'hinh-su': 2,
  'to-tung': 3, 'lao-dong': 3, 'dat-dai': 3, 'thuong-mai': 3, 'tai-chinh': 3,
};

/** Lĩnh vực chưa có chương nào trong nội dung hiện tại (cập nhật khi thêm môn). */
export const FUTURE_FIELDS: readonly Field[] = [];

/** Hiến pháp chia theo chương: nền tảng / quyền công dân và bầu cử / Quốc hội / bộ máy (Chủ tịch nước, Chính phủ, Tòa án – VKS, địa phương). */
const CHAPTER_FIELD: Record<string, Record<string, Field>> = {
  'hien-phap': {
    'c1-nhung-van-de-chung': 'hien-phap', 'c2-khai-niem-dac-trung': 'hien-phap', 'c3-che-do-chinh-tri': 'hien-phap',
    'c4-quyen-con-nguoi': 'quyen-cong-dan', 'c5-quoc-tich': 'quyen-cong-dan', 'c6-bau-cu': 'quyen-cong-dan', 'c7-quoc-hoi': 'lap-phap',
    'c8-chu-tich-nuoc': 'bo-may', 'c9-chinh-phu': 'bo-may', 'c10-toa-an-vien-kiem-sat': 'bo-may', 'c11-chinh-quyen-dia-phuong': 'bo-may',
    'nang-cao': 'hien-phap',
  },
};
const TM: Field = 'thuong-mai';
const TC: Field = 'tai-chinh';
/** Lĩnh vực theo môn. Sở hữu trí tuệ là chế định dân sự; Lý luận NN&PL tách riêng (nền tảng năm 1); thương mại và tài chính tách để Hành pháp đòi đúng tài chính công. */
const SUBJECT_FIELD: Record<string, Field> = {
  'hien-phap': 'hien-phap', 'ly-luan-nn-pl': 'ly-luan', 'lich-su-nn-pl': 'lich-su', 'xay-dung-vbpl': 'lap-phap',
  'hanh-chinh': 'hanh-chinh', 'dan-su': 'dan-su', 'dan-su-2': 'dan-su', 'so-huu-tri-tue': 'dan-su', 'tai-san-tri-tue': 'dan-su',
  'hinh-su': 'hinh-su', 'to-tung-dan-su': 'to-tung', 'lao-dong': 'lao-dong', 'lao-dong-2': 'lao-dong', 'an-sinh-xa-hoi': 'lao-dong', 'dat-dai': 'dat-dai',
  'thuong-mai-1': TM, 'thuong-mai': TM, 'canh-tranh': TM, 'dau-tu': TM, 'ngan-hang': TC, 'tai-chinh': TC, 'tai-chinh-doanh-nghiep': TC, 'chung-khoan': TC,
};

/** Môn chưa khai báo trong bảng rơi về lĩnh vực nền tảng. */
export const DEFAULT_FIELD: Field = 'hien-phap';

/** Lĩnh vực của chương: theo bảng chương, không có thì theo môn, cuối cùng DEFAULT_FIELD. */
export function fieldOf(subjectId: string, chapterId: string): Field {
  return CHAPTER_FIELD[subjectId]?.[chapterId] ?? SUBJECT_FIELD[subjectId] ?? DEFAULT_FIELD;
}
